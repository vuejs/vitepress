import { SUB_PREFIX } from './constants'
import { newPage, realErrors, waitForHydration, type TestPage } from './helpers'

// the cdn build, served at the root by a host that picks the nearest 404.html
const nearest = () => `http://localhost:${process.env['PAGES_PORT']}`
// the plain build, served by a host that only knows the root 404.html
const rootOnly = () => `http://localhost:${process.env['PLAIN_PORT']}`
// the relative build, mounted under a prefix
const sub = () => `http://localhost:${process.env['SUB_PORT']}${SUB_PREFIX}`

let t: TestPage

beforeAll(async () => {
  t = await newPage()
})

afterAll(async () => {
  await t.page.close()
  await t.browser.close()
})

beforeEach(() => {
  t.errors.length = 0
})

const h1 = () => t.page.textContent('h1')
// the document of a miss is a 404 by design; anything else is a real error
const errors = () => realErrors(t.errors, [t.page.url()])
const lang = () => t.page.evaluate(() => document.documentElement.lang)
const mark = () => t.page.evaluate(() => ((window as any).__spa_marker = 1))
const marked = () => t.page.evaluate(() => (window as any).__spa_marker === 1)

describe('not-found page on a host serving the nearest 404.html', () => {
  test('a miss shows the theme page when the site has no 404.md', async () => {
    const res = await t.page.goto(`${nearest()}/nowhere.html`)
    expect(res?.status()).toBe(404)
    await waitForHydration(t.page)
    expect(await t.page.textContent('.NotFound .title')).toBe('PAGE NOT FOUND')
    expect(await t.page.title()).toBe('404 | Base Fixture')
    expect(await t.page.getAttribute('.NotFound .link', 'href')).toBe('/')
    expect(new URL(t.page.url()).pathname).toBe('/nowhere.html')
    expect(errors()).toEqual([])
  })

  test("a miss under a locale shows that locale's 404.md", async () => {
    const res = await t.page.goto(`${nearest()}/zh/guide/nowhere.html`)
    expect(res?.status()).toBe(404)
    await waitForHydration(t.page)
    expect(await h1()).toContain('页面未找到')
    expect(await lang()).toBe('zh-CN')
    expect(await t.page.title()).toBe('页面未找到 | Base Fixture')
    expect(errors()).toEqual([])
  })

  test('the theme page uses the locale text of the miss', async () => {
    // the root build has no zh text of its own: only the client knows the
    // locale, from the url
    await t.page.goto(`${nearest()}/nowhere.html`)
    await waitForHydration(t.page)
    expect(await t.page.textContent('.NotFound .title')).toBe('PAGE NOT FOUND')
    expect(await lang()).toBe('en')
  })

  test('a 404 served for a url that has a page renders that page', async () => {
    // the static host has no `index` -> `index.html` rule, so this is a miss
    // for the server and a real page for the client
    const res = await t.page.goto(`${nearest()}/sub/index`)
    expect(res?.status()).toBe(404)
    await waitForHydration(t.page)
    expect(await h1()).toContain('Sub index')
    expect(errors()).toEqual([])
  })

  test('the not-found page renders at its own url', async () => {
    const res = await t.page.goto(`${nearest()}/zh/404.html`)
    expect(res?.status()).toBe(200)
    await waitForHydration(t.page)
    expect(await h1()).toContain('页面未找到')
    expect(errors()).toEqual([])
  })

  test('client-side navigation to a miss keeps the url and recovers', async () => {
    await t.page.goto(`${nearest()}/`)
    await waitForHydration(t.page)
    await mark()
    await t.page.evaluate(() => {
      const a = document.createElement('a')
      a.href = '/zh/nowhere.html'
      a.id = 'to-nowhere'
      a.textContent = 'nowhere'
      // above the fixed nav and sidebar, so the click reaches it
      a.style.cssText = 'position:fixed;right:0;bottom:0;z-index:1000'
      document.body.appendChild(a)
    })
    await t.page.click('#to-nowhere')
    await t.page.waitForFunction(() =>
      document.querySelector('h1')?.textContent?.includes('页面未找到')
    )
    expect(new URL(t.page.url()).pathname).toBe('/zh/nowhere.html')
    expect(await lang()).toBe('zh-CN')
    expect(await marked()).toBe(true)

    await t.page.click('.vp-doc a[href="/zh/"]')
    await t.page.waitForFunction(() =>
      document.querySelector('h1')?.textContent?.includes('首页')
    )
    expect(await marked()).toBe(true)
    expect(errors()).toEqual([])
  })
})

describe('not-found page on a host serving only the root 404.html', () => {
  test("a miss under a locale still shows that locale's page", async () => {
    const res = await t.page.goto(`${rootOnly()}/zh/nowhere.html`)
    expect(res?.status()).toBe(404)
    await waitForHydration(t.page)
    expect(await h1()).toContain('页面未找到')
    expect(await lang()).toBe('zh-CN')
    expect(await t.page.title()).toBe('页面未找到 | Base Fixture')
    expect(errors()).toEqual([])
  })

  test('a miss outside any locale shows the theme page', async () => {
    await t.page.goto(`${rootOnly()}/deep/nowhere.html`)
    await waitForHydration(t.page)
    expect(await t.page.textContent('.NotFound .title')).toBe('PAGE NOT FOUND')
    expect(errors()).toEqual([])
  })
})

describe('not-found page with a relative base', () => {
  test('a miss under a locale is styled and localized', async () => {
    const res = await t.page.goto(`${sub()}zh/nowhere.html`)
    expect(res?.status()).toBe(404)
    await waitForHydration(t.page)
    expect(await h1()).toContain('页面未找到')
    expect(await t.page.evaluate(() => (window as any).__VP_SITE_ROOT__)).toBe(
      sub()
    )
    expect(errors()).toEqual([])
  })

  test('a root-level miss shows the theme page', async () => {
    await t.page.goto(`${sub()}nowhere.html`)
    await waitForHydration(t.page)
    expect(await t.page.textContent('.NotFound .title')).toBe('PAGE NOT FOUND')
    expect(await t.page.getAttribute('.NotFound .link', 'href')).toBe(
      SUB_PREFIX
    )
    expect(errors()).toEqual([])
  })
})
