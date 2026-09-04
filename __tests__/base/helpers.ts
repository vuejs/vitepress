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
    if (msg.type() !== 'error') return
    // a failed resource is only identified by where it came from
    const url = msg.location()?.url
    errors.push(url ? `${msg.text()} <${url}>` : msg.text())
  })
  page.on('pageerror', (err) => errors.push(String(err)))
  return { browser, page, errors }
}

export function realErrors(errors: string[], ignore: string[] = []): string[] {
  return errors.filter(
    (e) =>
      !e.includes('favicon') && !ignore.some((url) => e.includes(`<${url}>`))
  )
}

export async function waitForHydration(page: Page): Promise<void> {
  await page.waitForSelector('#app .Layout')
  await page.waitForFunction(
    () => (document.querySelector('#app') as any)?.__vue_app__ !== undefined
  )
}
