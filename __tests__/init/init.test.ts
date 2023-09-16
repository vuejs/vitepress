import fs from 'fs-extra'
import getPort from 'get-port'
import { chromium } from 'playwright-chromium'
import { fileURLToPath, URL } from 'url'
import { createServer, scaffold, ScaffoldThemeType } from 'vitepress'

const root = fileURLToPath(new URL('./.temp', import.meta.url))

const browser = await chromium.launch({
  headless: !process.env.DEBUG,
  args: process.env.CI
    ? ['--no-sandbox', '--disable-setuid-sandbox']
    : undefined
})

const page = await browser.newPage()

const themes = [
  ScaffoldThemeType.Default,
  ScaffoldThemeType.DefaultCustom,
  ScaffoldThemeType.Custom
]
const usingTs = [false, true]
const variations = themes.flatMap((theme) =>
  usingTs.map(
    (useTs) => [`${theme}${useTs ? ' + ts' : ''}`, { theme, useTs }] as const
  )
)

afterAll(async () => {
  await page.close()
  await browser.close()
})

test.each(variations)('init %s', async (_, { theme, useTs }) => {
  await fs.remove(root)
  scaffold({ root, theme, useTs, injectNpmScripts: false })

  const port = await getPort()
  const server = await createServer(root, { port })
  await server.listen()

  async function goto(path: string) {
    await page.goto(`http://localhost:${port}${path}`)
    await page.waitForSelector('#app div')
  }

  try {
    await goto('/')
    expect(await page.textContent('h1')).toMatch('My Awesome Project')

    await page.click('a[href="/markdown-examples.html"]')
    await page.waitForFunction('document.querySelector("pre code")')
    expect(await page.textContent('h1')).toMatch('Markdown Extension Examples')

    await goto('/')
    expect(await page.textContent('h1')).toMatch('My Awesome Project')

    await page.click('a[href="/api-examples.html"]')
    await page.waitForFunction('document.querySelector("pre code")')
    expect(await page.textContent('h1')).toMatch('Runtime API Examples')

    // teardown
  } finally {
    await fs.remove(root)
    await server.close()
  }
})
