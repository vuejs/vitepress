import { spawnSync } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { createServer, type Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { extname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { chromium, type BrowserServer } from 'playwright-chromium'

import { ALT_PREFIX, SUB_PREFIX } from './constants'

const dir = resolve(fileURLToPath(import.meta.url), '..')
const bin = resolve(dir, '../../bin/vitepress.js')
const dist = (mode: string) => resolve(dir, `fixture/.vitepress/dist-${mode}`)

const types: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.zip': 'application/zip'
}

// listens on an os-assigned port (the other suites run in parallel on CI,
// so a pre-picked "free" port can be taken before we bind it)
function serveStatic(
  mounts: [prefix: string, root: string][],
  cors: boolean
): Promise<Server> {
  const server = createServer(async (req, res) => {
    const url = decodeURIComponent(new URL(req.url!, 'http://x').pathname)
    for (const [prefix, root] of mounts) {
      if (!url.startsWith(prefix)) continue
      let file = url.slice(prefix.length) || 'index.html'
      if (file.endsWith('/')) file += 'index.html'
      try {
        const data = await readFile(join(root, file))
        const headers: Record<string, string> = {
          'content-type': types[extname(file)] ?? 'application/octet-stream'
        }
        if (cors) headers['access-control-allow-origin'] = '*'
        res.writeHead(200, headers)
        res.end(data)
        return
      } catch {}
    }
    res.writeHead(404)
    res.end('not found')
  })
  return new Promise((r) => server.listen(0, () => r(server)))
}

const portOf = (server: Server) => (server.address() as AddressInfo).port

let browserServer: BrowserServer
let servers: Server[] = []

export async function setup() {
  // the cdn server starts before its dist exists (requests just 404 until
  // the build lands) so the real port can be baked into assetsBase
  const cdnServer = await serveStatic([['/', dist('cdn')]], true)
  const cdnPort = portOf(cdnServer)

  // each flavor builds in its own process: the markdown renderer is a
  // process-wide singleton, so sequential in-process builds would leak the
  // first build's base into the rest
  for (const mode of ['plain', 'relative', 'cdn', 'mpa']) {
    const res = spawnSync(process.execPath, [bin, 'build', 'fixture'], {
      cwd: dir,
      env: {
        ...process.env,
        VP_TEST_MODE: mode,
        VP_CDN_PORT: String(cdnPort)
      },
      encoding: 'utf-8'
    })
    if (res.status !== 0) {
      throw new Error(`build (${mode}) failed:\n${res.stdout}\n${res.stderr}`)
    }
  }

  servers = [
    // one relative-base build mounted at two unrelated prefixes
    await serveStatic(
      [
        [SUB_PREFIX, dist('relative')],
        [ALT_PREFIX, dist('relative')]
      ],
      false
    ),
    await serveStatic([['/', dist('cdn')]], false),
    cdnServer
  ]

  browserServer = await chromium.launchServer({
    headless: !process.env.DEBUG,
    args: process.env.CI
      ? ['--no-sandbox', '--disable-setuid-sandbox']
      : undefined
  })

  process.env['WS_ENDPOINT'] = browserServer.wsEndpoint()
  process.env['SUB_PORT'] = String(portOf(servers[0]!))
  process.env['PAGES_PORT'] = String(portOf(servers[1]!))
  process.env['VP_CDN_PORT'] = String(cdnPort)
}

export async function teardown() {
  await browserServer.close()
  await Promise.all(
    servers.map(
      (server) =>
        new Promise<void>((resolve, reject) =>
          server.close((err) => (err ? reject(err) : resolve()))
        )
    )
  )
}
