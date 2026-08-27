import { newPage, realErrors, waitForHydration, type TestPage } from './helpers'

const origin = () => `http://localhost:${process.env['PAGES_PORT']}`
const cdnPort = () => process.env['VP_CDN_PORT']

let t: TestPage

beforeAll(async () => {
  t = await newPage()
})

afterAll(async () => {
  await t.page.close()
  await t.browser.close()
})

describe('assetsBase with a separate cdn origin', () => {
  test('pages hydrate from cross-origin assets', async () => {
    await t.page.goto(`${origin()}/`)
    await waitForHydration(t.page)
    const cdnResources = await t.page.evaluate(
      (port) =>
        performance
          .getEntriesByType('resource')
          .filter((r) => r.name.includes(`:${port}/`)).length,
      cdnPort()
    )
    expect(cdnResources).toBeGreaterThan(5)
  })

  test('client-side navigation loads page chunks from the cdn', async () => {
    await t.page.evaluate(() => ((window as any).__spa_marker = 1))
    await t.page.click('.vp-doc a[href="/sub/page.html"]')
    await t.page.waitForFunction(() =>
      document.querySelector('h1')?.textContent?.includes('Sub page')
    )
    expect(
      await t.page.evaluate(() => (window as any).__spa_marker === 1)
    ).toBe(true)
    const chunkFromCdn = await t.page.evaluate(
      (port) =>
        performance
          .getEntriesByType('resource')
          .some((r) => r.name.includes(`:${port}/`) && r.name.includes('.md.')),
      cdnPort()
    )
    expect(chunkFromCdn).toBe(true)
  })

  test('search works with the index chunk on the cdn', async () => {
    await t.page.click('.VPNavBarSearchButton')
    const input = await t.page.waitForSelector('input#localsearch-input')
    await input.type('xylophone')
    await t.page.waitForSelector('#localsearch-list li[role=option] a')
    expect(
      await t.page.getAttribute('#localsearch-list li[role=option] a', 'href')
    ).toBe('/sub/deep/page2.html#deep-heading')
  })

  test('no console or page errors across the whole flow', () => {
    expect(realErrors(t.errors)).toEqual([])
  })
})
