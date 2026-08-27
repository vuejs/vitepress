import { spawnSync } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { createServer, type Server } from 'node:http'
import { extname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import getPort from 'get-port'
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

function serveStatic(
  port: number,
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
  return new Promise((r) => server.listen(port, () => r(server)))
}

let browserServer: BrowserServer
let servers: Server[] = []

export async function setup() {
  const [subPort, pagesPort, cdnPort] = await Promise.all([
    getPort(),
    getPort(),
    getPort()
  ])

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
      subPort,
      [
        [SUB_PREFIX, dist('relative')],
        [ALT_PREFIX, dist('relative')]
      ],
      false
    ),
    await serveStatic(pagesPort, [['/', dist('cdn')]], false),
    await serveStatic(cdnPort, [['/', dist('cdn')]], true)
  ]

  browserServer = await chromium.launchServer({
    headless: !process.env.DEBUG,
    args: process.env.CI
      ? ['--no-sandbox', '--disable-setuid-sandbox']
      : undefined
  })

  process.env['WS_ENDPOINT'] = browserServer.wsEndpoint()
  process.env['SUB_PORT'] = String(subPort)
  process.env['PAGES_PORT'] = String(pagesPort)
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
