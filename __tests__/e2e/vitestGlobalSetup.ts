import getPort from 'get-port'
import { chromium, type BrowserServer } from 'playwright-chromium'
import { type ViteDevServer } from 'vite'
import { createServer } from 'vitepress'

let browserServer: BrowserServer
let devServer: ViteDevServer

export async function setup() {
  browserServer = await chromium.launchServer({
    headless: !process.env.VITE_DEBUG_SERVE,
    args: process.env.CI
      ? ['--no-sandbox', '--disable-setuid-sandbox']
      : undefined
  })
  process.env['WS_ENDPOINT'] = browserServer.wsEndpoint()
  const port = await getPort()
  process.env['PORT'] = port.toString()
  devServer = await createServer('__tests__/e2e', { port })
  await devServer.listen()
}

export async function teardown() {
  await browserServer.close()
  await devServer.close()
}
