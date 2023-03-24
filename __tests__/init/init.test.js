// @ts-check

import { expect, test } from '@playwright/test'
import fs from 'fs-extra'
import getPort from 'get-port'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  ScaffoldThemeType,
  build,
  createServer,
  scaffold,
  serve
} from 'vitepress'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'temp')

const themes = [
  ScaffoldThemeType.Default,
  ScaffoldThemeType.DefaultCustom,
  ScaffoldThemeType.Custom
]
const usingTs = [false, true]

for (const theme of themes) {
  for (const useTs of usingTs) {
    test(`${theme} (ts=${useTs})`, async ({ page }) => {
      // set up

      await fs.remove(root)
      scaffold({
        root,
        theme,
        useTs,
        injectNpmScripts: false
      })

      const port = await getPort()

      /** @param {string} path */
      const goto = async (path) => {
        await page.goto(`http://localhost:${port}${path}`)
        await page.waitForSelector('#app div')
      }

      const server = await (async () => {
        if (process.env['VITE_TEST_BUILD']) {
          await build(root)
          return (await serve({ root, port })).server
        }
        return (await createServer(root, { port })).listen()
      })()

      // test
      try {
        await goto('/')
        expect(await page.textContent('h1')).toMatch('My Awesome Project')

        await page.click('a[href="/markdown-examples.html"]')
        await page.waitForSelector('pre code')
        expect(await page.textContent('h1')).toMatch(
          'Markdown Extension Examples'
        )

        await goto('/')
        expect(await page.textContent('h1')).toMatch('My Awesome Project')

        await page.click('a[href="/api-examples.html"]')
        await page.waitForSelector('pre code')
        expect(await page.textContent('h1')).toMatch('Runtime API Examples')

        // clean up
      } finally {
        if ('ws' in server) await server.close()
        else {
          await /** @type {Promise<void>} */ (
            new Promise((resolve, reject) => {
              server.close((error) => (error ? reject(error) : resolve()))
            })
          )
        }
        await fs.remove(root)
      }
    })
  }
}
