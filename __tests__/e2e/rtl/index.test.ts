const box = (selector: string) =>
  page
    .locator(selector)
    .first()
    .evaluate((el) => {
      const { x, y, width, height } = el.getBoundingClientRect()
      return { x, y, width, height, right: x + width, bottom: y + height }
    })

// screen positions of the first and last characters of an element's text,
// which is how the bidi algorithm's reordering shows up
const glyphEnds = (selector: string) =>
  page
    .locator(selector)
    .first()
    .evaluate((el) => {
      const node = el.firstChild as Text
      const range = document.createRange()
      range.setStart(node, 0)
      range.setEnd(node, 1)
      const first = range.getBoundingClientRect().x
      range.setStart(node, node.length - 1)
      range.setEnd(node, node.length)
      const last = range.getBoundingClientRect().x
      return { first, last }
    })

// scrolls a heading into view until the outline marks it active. The scroll
// is re-issued on every check, so a lost scroll event or a dev-server reload
// triggered by another spec cannot leave the wait hanging (seen on Windows CI)
const activateHeading = (id: string) =>
  page.waitForFunction((id) => {
    if (document.querySelector(`.outline-link.active[href="#${id}"]`)) {
      return true
    }
    document.getElementById(id)?.scrollIntoView()
    return false
  }, id)

describe('rtl', () => {
  beforeAll(async () => {
    await goto('/rtl/')
  })

  afterAll(async () => {
    await page.setViewportSize({ width: 1280, height: 720 })
  })

  test('sets the direction on the html element', async () => {
    expect(await page.getAttribute('html', 'dir')).toBe('rtl')
    if (process.env['VITE_TEST_BUILD']) {
      const html = await (await page.request.get(page.url())).text()
      expect(html).toContain('<html lang="en-US" dir="rtl">')
    }
  })

  test('lays the page out from the right', async () => {
    const width = await page.evaluate(() => innerWidth)
    const sidebar = await box('.VPSidebar')
    expect(sidebar.right).toBeGreaterThan(width - 1)
    expect(sidebar.x).toBeGreaterThan(width / 2)

    const heading = await box('.vp-doc h1')
    const title = await glyphEnds('.vp-doc h1')
    expect(title.last).toBeGreaterThan(heading.x + heading.width / 2)

    const anchor = await box('.vp-doc h2 .header-anchor')
    const h2 = await box('.vp-doc h2')
    expect(anchor.x).toBeGreaterThan(h2.x + h2.width / 2)
  })

  test('keeps the outline marker on the reading side and moving', async () => {
    const outline = await box('.VPDocAsideOutline .content')
    await activateHeading('section-one')
    const before = await box('.outline-marker')
    expect(before.x).toBeGreaterThan(outline.x + outline.width / 2)

    await activateHeading('section-two')
    const after = await box('.outline-marker')
    expect(after.y).toBeGreaterThan(before.y)
    expect(Math.abs(after.x - before.x)).toBeLessThan(1)
  })

  test('mirrors the sidebar caret when a group collapses', async () => {
    const group = page.locator('.VPSidebarItem.level-0.collapsible').first()
    await group.locator('.caret').first().click()
    expect(
      await group.evaluate((el) => el.classList.contains('collapsed'))
    ).toBe(true)
    expect(
      await group
        .locator('.caret-icon')
        .first()
        .evaluate((el) => getComputedStyle(el).scale)
    ).toBe('-1 1')
    await group.locator('.caret').first().click()
  })

  test('keeps code left-to-right', async () => {
    const wrapper = page.locator('.vp-doc div[class*="language-"]').first()
    expect(await wrapper.getAttribute('dir')).toBe('ltr')
    expect(
      await wrapper
        .locator('pre')
        .evaluate((el) => getComputedStyle(el).direction)
    ).toBe('ltr')

    const block = await box('.vp-doc div[class*="language-"]')
    const copy = await box('.vp-doc div[class*="language-"] > button.copy')
    const gutter = await box(
      '.vp-doc div[class*="language-"] > .line-numbers-wrapper'
    )
    expect(copy.x).toBeGreaterThan(block.x + block.width / 2)
    expect(gutter.right).toBeLessThan(block.x + block.width / 2)

    const flag = await glyphEnds('.vp-doc p code')
    expect(flag.first).toBeLessThan(flag.last)
  })

  test('mirrors the external link icon', async () => {
    const mask = await page
      .locator('.vp-doc a[href^="https://"]')
      .first()
      .evaluate((el) => {
        const style = getComputedStyle(el, '::after')
        return style.maskImage || style.webkitMaskImage
      })
    expect(mask).toContain('matrix(-1 0 0 1 24 0)')
  })

  test('slides the mobile sidebar in from the right', async () => {
    await page.setViewportSize({ width: 375, height: 812 })
    await goto('/rtl/')
    const viewport = await page.evaluate(
      () => document.documentElement.clientWidth
    )
    const closed = await box('.VPSidebar')
    expect(closed.x).toBeGreaterThanOrEqual(viewport - 1)

    // open the sidebar and wait for its slide-in to settle against the right
    // edge, reopening it if a reload closed it meanwhile (see activateHeading)
    await page.waitForFunction(() => {
      const sidebar = document.querySelector('.VPSidebar')!
      if (!sidebar.classList.contains('open')) {
        document.querySelector<HTMLElement>('.VPLocalNav .menu')?.click()
        return false
      }
      const { right } = sidebar.getBoundingClientRect()
      return Math.abs(right - document.documentElement.clientWidth) < 1
    })
    const open = await box('.VPSidebar')
    expect(open.x).toBeLessThan(viewport)
  })
})
