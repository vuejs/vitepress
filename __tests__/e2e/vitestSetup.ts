import { chromium, type Browser } from 'playwright-chromium'

let browser: Browser

beforeAll(async () => {
  browser = await chromium.connect(process.env['WS_ENDPOINT']!)
  globalThis.page = await browser.newPage()
  globalThis.goto = async (path: string) => {
    await page.goto(`http://localhost:${process.env['PORT']}${path}`)
    await page.waitForSelector('#app .Layout')
  }
})

afterAll(async () => {
  await page.close()
  await browser.close()
  // @ts-ignore
  delete globalThis.page
  // @ts-ignore
  delete globalThis.goto
})
