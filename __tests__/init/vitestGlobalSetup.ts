import { chromium, type BrowserServer } from 'playwright-chromium'

let browserServer: BrowserServer

export async function setup() {
  browserServer = await chromium.launchServer({
    headless: !process.env.DEBUG,
    args: process.env.CI
      ? ['--no-sandbox', '--disable-setuid-sandbox']
      : undefined
  })
  process.env['WS_ENDPOINT'] = browserServer.wsEndpoint()
}

export async function teardown() {
  await browserServer.close()
}
