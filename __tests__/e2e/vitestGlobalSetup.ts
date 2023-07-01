import getPort from 'get-port'
import { chromium, type BrowserServer } from 'playwright-chromium'
import { build, createServer, serve } from 'vitepress'
import type { ViteDevServer } from 'vite'
import type { Server } from 'net'

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
    await build(root)
    server = (await serve({ root, port })).server
  } else {
    server = await createServer(root, { port })
    await server!.listen()
  }
}

export async function teardown() {
  await browserServer.close()
  if ('ws' in server) {
    await server.close()
  } else {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()))
    })
  }
}
