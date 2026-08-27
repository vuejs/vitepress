import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { newPage, type TestPage } from './helpers'

const dist = resolve(
  fileURLToPath(import.meta.url),
  '..',
  'fixture/.vitepress/dist-relative'
)

let t: TestPage

beforeAll(async () => {
  t = await newPage()
})

afterAll(async () => {
  await t.page.close()
  await t.browser.close()
})

// no hydration over file:// — module scripts are CORS-blocked from disk in
// every engine — but the pre-rendered site must stay styled and navigable
describe('relative base opened over file://', () => {
  test('pages render styled with working images', async () => {
    await t.page.goto('file://' + join(dist, 'sub/page.html'))
    expect(await t.page.textContent('h1')).toContain('Sub page')
    const fontFamily = await t.page.evaluate(
      () => getComputedStyle(document.body).fontFamily
    )
    expect(fontFamily).toContain('Inter')
    const logoLoaded = await t.page.evaluate(
      () =>
        document.querySelector<HTMLImageElement>('img[alt="logo again"]')!
          .naturalWidth
    )
    expect(logoLoaded).toBe(1)
  })

  test('content links navigate between files', async () => {
    await t.page.click('.vp-doc a[href="../sub/deep/page2.html"]')
    expect(await t.page.textContent('h1')).toContain('Deep page')
    expect(t.page.url()).toBe('file://' + join(dist, 'sub/deep/page2.html'))
  })

  test('theme links navigate between files', async () => {
    await t.page.click('.VPSidebar a[href="../../moved/target.html"]')
    expect(await t.page.textContent('h1')).toContain('Moved page')
    expect(t.page.url()).toBe('file://' + join(dist, 'moved/target.html'))
  })

  test('the root page reaches nested pages', async () => {
    await t.page.goto('file://' + join(dist, 'index.html'))
    await t.page.click('.vp-doc a[href="./sub/index.html"]')
    expect(await t.page.textContent('h1')).toContain('Sub index')
  })
})
