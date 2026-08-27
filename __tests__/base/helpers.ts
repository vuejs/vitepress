import { chromium, type Browser, type Page } from 'playwright-chromium'

export interface TestPage {
  browser: Browser
  page: Page
  errors: string[]
}

export async function newPage(): Promise<TestPage> {
  const browser = await chromium.connect(process.env['WS_ENDPOINT']!)
  const page = await browser.newPage()
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })
  page.on('pageerror', (err) => errors.push(String(err)))
  return { browser, page, errors }
}

export function realErrors(errors: string[]): string[] {
  return errors.filter((e) => !e.includes('favicon'))
}

export async function waitForHydration(page: Page): Promise<void> {
  await page.waitForSelector('#app .Layout')
  await page.waitForFunction(
    () => (document.querySelector('#app') as any)?.__vue_app__ !== undefined
  )
}
