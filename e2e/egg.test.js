const path = require('path')
const {
  launchDevServer,
  launchBrowser,
  prepareFixture,
  getText
} = require('./common/utils')

const binPath = path.resolve(__dirname, '../bin/vitepress.js')
const fixtureDir = path.join(__dirname, '../playground/egg')
const tempDir = path.join(__dirname, '../.fixtures/egg')

let devServer, browser

beforeAll(async () => {
  await prepareFixture(fixtureDir, tempDir)
  devServer = await launchDevServer(binPath, tempDir)
  browser = await launchBrowser()
})

afterAll(async () => {
  await browser.close()
  await devServer.close()
})

test('egg test', async () => {
  const page = await browser.newPage()
  page.setViewport({ width: 1600, height: 900 })

  await page.goto('http://localhost:3000/')
  await page.waitFor('h1')

  expect(await getText(page, 'h1')).toMatch('# (WIP) VitePress 📝💨')
  await page.screenshot({ path: path.join(tempDir, 'egg.png') })
})
