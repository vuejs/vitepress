import { ALT_PREFIX, SUB_PREFIX } from './constants'
import { newPage, realErrors, waitForHydration, type TestPage } from './helpers'

const origin = () => `http://localhost:${process.env['SUB_PORT']}`

let t: TestPage

beforeAll(async () => {
  t = await newPage()
})

afterAll(async () => {
  await t.page.close()
  await t.browser.close()
})

// mark the window so a passing test proves navigation stayed client-side
const mark = () => t.page.evaluate(() => ((window as any).__spa_marker = 1))
const marked = () => t.page.evaluate(() => (window as any).__spa_marker === 1)

describe('relative base served from a deep subpath', () => {
  test('deep link loads and hydrates', async () => {
    await t.page.goto(`${origin()}${SUB_PREFIX}sub/deep/page2.html`)
    await waitForHydration(t.page)
    expect(await t.page.textContent('h1')).toContain('Deep page')
    expect(
      await t.page.evaluate(() => (window as any).__VP_SITE_ROOT__)
    ).toBe(`${origin()}${SUB_PREFIX}`)
  })

  test('sidebar navigation is client-side and lands on the right url', async () => {
    await mark()
    await t.page.click(`.VPSidebar a[href="${SUB_PREFIX}sub/page.html"]`)
    await t.page.waitForFunction(
      () => document.querySelector('h1')?.textContent?.includes('Sub page')
    )
    expect(await marked()).toBe(true)
    expect(new URL(t.page.url()).pathname).toBe(`${SUB_PREFIX}sub/page.html`)
  })

  test('content links navigate client-side', async () => {
    await t.page.click('.vp-doc a[href="../index.html"]')
    await t.page.waitForFunction(
      () => document.querySelector('h1')?.textContent?.includes('Home')
    )
    expect(await marked()).toBe(true)
    // the router strips index.html from the address bar
    expect(new URL(t.page.url()).pathname).toBe(SUB_PREFIX)
  })

  test('search finds pages and navigates to them', async () => {
    await t.page.click('.VPNavBarSearchButton')
    const input = await t.page.waitForSelector('input#localsearch-input')
    await input.type('xylophone')
    await t.page.waitForSelector('#localsearch-list li[role=option] a')
    const href = await t.page.getAttribute(
      '#localsearch-list li[role=option] a',
      'href'
    )
    expect(href).toBe(`${SUB_PREFIX}sub/deep/page2.html#deep-heading`)
    await t.page.click('#localsearch-list li[role=option] a')
    await t.page.waitForFunction(
      () => document.querySelector('h1')?.textContent?.includes('Deep page')
    )
    expect(await marked()).toBe(true)
  })

  test('history back keeps working', async () => {
    await t.page.goBack()
    await t.page.waitForFunction(
      () => document.querySelector('h1')?.textContent?.includes('Home')
    )
    expect(new URL(t.page.url()).pathname).toBe(SUB_PREFIX)
  })

  test('the same build works mounted at a different prefix', async () => {
    await t.page.goto(`${origin()}${ALT_PREFIX}index.html`)
    await waitForHydration(t.page)
    await mark()
    await t.page.click('.vp-doc a[href="./sub/page.html"]')
    await t.page.waitForFunction(
      () => document.querySelector('h1')?.textContent?.includes('Sub page')
    )
    expect(await marked()).toBe(true)
    expect(new URL(t.page.url()).pathname).toBe(`${ALT_PREFIX}sub/page.html`)
  })

  test('no console or page errors across the whole flow', () => {
    expect(realErrors(t.errors)).toEqual([])
  })
})
