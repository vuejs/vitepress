import getPort from 'get-port'
import type { Server } from 'node:net'
import { chromium, type BrowserServer } from 'playwright-chromium'
import type { ViteDevServer } from 'vite'
import { build, createServer, serve } from 'vitepress'

let browserServer: BrowserServer
let server: ViteDevServer | Server

const root = '.'

export async function setup() {
  browserServer = await chromium.launchServer({
    headless: !process.env.DEBUG,
    args: process.env.CI
      ? ['--no-sandbox', '--disable-setuid-sandbox']
      : undefined
  })
  process.env['WS_ENDPOINT'] = browserServer.wsEndpoint()
  const port = await getPort()
  process.env['PORT'] = port.toString()

  if (process.env['VITE_TEST_BUILD']) {
    if (process.env.VITE_TEST_SSR_BATCH) {
      let afterConfigResolveCalls = 0
      await build(root, {
        onAfterConfigResolve(siteConfig) {
          afterConfigResolveCalls++
          siteConfig.site.head.push([
            'meta',
            {
              name: 'ssr-batch-after-config-resolve',
              content: 'coordinator mutation retained'
            }
          ])
        }
      })
      if (afterConfigResolveCalls !== 1) {
        throw new Error(
          `Expected one coordinator config hook call, received ${afterConfigResolveCalls}`
        )
      }
    } else {
      await build(root)
    }
    server = (await serve({ root, port })).server
  } else {
    server = await createServer(root, { port })
    await server!.listen()
  }
}

export async function teardown() {
  await browserServer?.close()
  if (!server) return
  if ('ws' in server) {
    await server.close()
  } else {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()))
    })
  }
}
