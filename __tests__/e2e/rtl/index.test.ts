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

// the side on which each external link's icon was laid out: the icon is the
// link's ::after padding, so it is wherever the link box overhangs its text
const iconSides = () =>
  page.locator('.vp-doc a[href^="https://"]').evaluateAll((links) =>
    links.map((link) => {
      const range = document.createRange()
      range.selectNodeContents(link)
      const rects = Array.from(range.getClientRects()).filter((r) => r.width)
      const text = {
        left: Math.min(...rects.map((r) => r.left)),
        right: Math.max(...rects.map((r) => r.right))
      }
      const { left, right } = link.getBoundingClientRect()
      return {
        text: link.textContent,
        side: text.left - left > right - text.right ? 'left' : 'right'
      }
    })
  )

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

  test('mirrors the external link icon and keeps it after the link', async () => {
    // the icon glyph is keyed on the dir attribute, so a clone of the link in
    // an ltr island gets the unmirrored one
    const masks = await page
      .locator('.vp-doc a[href^="https://"]')
      .first()
      .evaluate((link) => {
        const mask = (el: Element) => {
          const style = getComputedStyle(el, '::after')
          return style.maskImage || style.webkitMaskImage
        }
        const island = document.createElement('div')
        island.dir = 'ltr'
        island.append(link.cloneNode(true))
        link.closest('.vp-doc')!.append(island)
        const result = { rtl: mask(link), ltr: mask(island.firstElementChild!) }
        island.remove()
        return result
      })
    expect(masks.rtl).toContain('data:image/svg+xml')
    expect(masks.ltr).not.toBe(masks.rtl)

    // every icon sits at the inline end (the left) of its link, whatever the
    // script of the link text and of the words around it
    const sides = await iconSides()
    expect(sides.length).toBeGreaterThan(1)
    expect(sides).toEqual(sides.map((link) => ({ ...link, side: 'left' })))
  })

  test('slides the mobile sidebar in from the right', async () => {
    await page.setViewportSize({ width: 375, height: 812 })
    await goto('/rtl/')
    const viewport = await page.evaluate(
      () => document.documentElement.clientWidth
    )
    const sidebar = page.locator('.VPSidebar')

    // closed, the drawer is parked beyond the right edge by its own width
    const closed = await box('.VPSidebar')
    expect(closed.x).toBeGreaterThanOrEqual(viewport - 1)
    const offset = await sidebar.evaluate(
      (el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).e
    )
    expect(offset).toBeCloseTo(closed.width, 0)

    await page.locator('.VPLocalNav .menu').click()
    await expect
      .poll(() => sidebar.evaluate((el) => el.classList.contains('open')), {
        timeout: 5000
      })
      .toBe(true)

    // assert the slide-in's end state directly instead of polling until the
    // transition settles there
    await page.evaluate(() => {
      for (const animation of document.getAnimations()) {
        try {
          animation.finish()
        } catch {}
      }
    })
    const open = await box('.VPSidebar')
    expect(Math.abs(open.right - viewport)).toBeLessThan(1)
    expect(open.width).toBe(closed.width)

    // locking the page behind the drawer must not reserve a scrollbar gutter
    // when no scrollbar was taking up space (none does in headless Chromium),
    // or the layout shifts by a scrollbar's width while the drawer is open
    expect(await box('html')).toMatchObject({ x: 0, width: viewport })
  })
})
