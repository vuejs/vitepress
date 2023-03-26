import { chromium, type Browser, type Page } from 'playwright-chromium'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs-extra'
import {
  scaffold,
  build,
  createServer,
  serve,
  ScaffoldThemeType,
  type ScaffoldOptions
} from 'vitepress'
import type { ViteDevServer } from 'vite'
import type { Server } from 'net'
import getPort from 'get-port'

let browser: Browser
let page: Page

beforeAll(async () => {
  browser = await chromium.connect(process.env['WS_ENDPOINT']!)
  page = await browser.newPage()
})

afterAll(async () => {
  await page.close()
  await browser.close()
})

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'temp')

async function testVariation(options: ScaffoldOptions) {
  fs.removeSync(root)
  scaffold({
    ...options,
    root
  })

  let server: ViteDevServer | Server
  const port = await getPort()

  async function goto(path: string) {
    await page.goto(`http://localhost:${port}${path}`)
    await page.waitForSelector('#app div')
  }

  if (process.env['VITE_TEST_BUILD']) {
    await build(root)
    server = (await serve({ root, port })).server
  } else {
    server = await createServer(root, { port })
    await server!.listen()
  }

  try {
    await goto('/')
    expect(await page.textContent('h1')).toMatch('My Awesome Project')

    await page.click('a[href="/markdown-examples.html"]')
    await page.waitForSelector('pre code')
    expect(await page.textContent('h1')).toMatch('Markdown Extension Examples')

    await goto('/')
    expect(await page.textContent('h1')).toMatch('My Awesome Project')

    await page.click('a[href="/api-examples.html"]')
    await page.waitForSelector('pre code')
    expect(await page.textContent('h1')).toMatch('Runtime API Examples')
  } finally {
    fs.removeSync(root)
    if ('ws' in server) {
      await server.close()
    } else {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()))
      })
    }
  }
}

const themes = [
  ScaffoldThemeType.Default,
  ScaffoldThemeType.DefaultCustom,
  ScaffoldThemeType.Custom
]
const usingTs = [false, true]

for (const theme of themes) {
  for (const useTs of usingTs) {
    test(`${theme}${useTs ? ` + TypeScript` : ``}`, () =>
      testVariation({
        root: '.',
        theme,
        useTs,
        injectNpmScripts: false
      }))
  }
}
