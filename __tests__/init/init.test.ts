import fs from 'fs-extra'
import getPort from 'get-port'
import type { Server } from 'net'
import path from 'path'
import { chromium, type Browser, type Page } from 'playwright-chromium'
import { fileURLToPath } from 'url'
import type { ViteDevServer } from 'vite'
import {
  ScaffoldThemeType,
  build,
  createServer,
  scaffold,
  serve
} from 'vitepress'

let browser: Browser
let page: Page
let server: ViteDevServer | Server

beforeAll(async () => {
  browser = await chromium.connect(process.env['WS_ENDPOINT']!)
  page = await browser.newPage()
})

afterAll(async () => {
  await page.close()
  await browser.close()
})

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'temp')

const themes = [
  ScaffoldThemeType.Default,
  ScaffoldThemeType.DefaultCustom,
  ScaffoldThemeType.Custom
]
const usingTs = [false, true]

const variations = themes.flatMap((theme) =>
  usingTs.map((useTs) => ({ theme, useTs }))
)

beforeEach(async () => {
  fs.removeSync(root)
})

afterEach(async () => {
  if ('ws' in server) {
    await server.close()
  } else {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()))
    })
  }
  fs.removeSync(root)
})

test.each(variations)(
  '$theme (TypeScript: $useTs)',
  async ({ theme, useTs }) => {
    scaffold({
      root,
      theme,
      useTs,
      injectNpmScripts: false
    })

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
  }
)
