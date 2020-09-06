const path = require('path')
const {
  launchDevServer,
  launchBrowser,
  prepareFixture,
  getEl
} = require('./common/utils')

const binPath = path.resolve(__dirname, '../bin/vitepress.js')
const fixtureDir = path.join(__dirname, '../playground/mdsyntax')
const tempDir = path.join(__dirname, '../.fixtures/mdsyntax')

let devServer, browser

beforeAll(async () => {
  await prepareFixture(fixtureDir, tempDir)
  devServer = await launchDevServer(binPath, tempDir)
  browser = await launchBrowser()
})

afterAll(async () => {
  if (browser) await browser.close()
  if (devServer) await devServer.close()
})

describe('markdown syntax', () => {
  test('basic', async () => {
    const page = await browser.newPage()
    page.setViewport({ width: 1600, height: 900 })

    await page.goto('http://localhost:3000/basic.html')
    await page.waitFor('main > div.content')

    const el = await getEl(page, 'main > div.content')
    const html = await el.evaluate((e) => e.outerHTML)

    await el.screenshot({ path: path.join(tempDir, 'basic.png') })
    expect(html).toMatchSnapshot()
  })
})
