describe('local nav outline dropdown', () => {
  // between 60rem and 80rem the outline renders as the local nav dropdown
  beforeEach(async () => {
    await page.setViewportSize({ width: 1187, height: 883 })
  })

  async function openAndMeasure() {
    await page.locator('.VPLocalNavOutlineDropdown > button').click()
    // the flyout slides in from -1rem, so wait for it to settle before measuring
    await page.waitForSelector(
      '.VPLocalNavOutlineDropdown .items:not(.flyout-enter-active)'
    )

    const measurements = await page.evaluate(() => {
      const items = document.querySelector<HTMLElement>(
        '.VPLocalNavOutlineDropdown .items'
      )!
      const overflows = items.scrollHeight > items.clientHeight
      items.scrollTop = items.scrollHeight
      const links = items.querySelectorAll<HTMLElement>('a.outline-link')
      return {
        overflows,
        viewportHeight: window.innerHeight,
        panelBottom: items.getBoundingClientRect().bottom,
        lastLinkBottom: links[links.length - 1]!.getBoundingClientRect().bottom
      }
    })

    // release the body scroll lock for the next test
    await page.keyboard.press('Escape')
    await page.waitForSelector('.VPLocalNavOutlineDropdown .items', {
      state: 'detached'
    })

    return measurements
  }

  test('stays inside the viewport when the page is scrolled', async () => {
    await goto('/markdown-extensions/')
    await page.evaluate(() => window.scrollTo(0, 1500))
    await page.waitForFunction(() => window.scrollY > 64)

    const { overflows, viewportHeight, panelBottom, lastLinkBottom } =
      await openAndMeasure()

    // the outline is long enough that the panel is capped by its max-height
    expect(overflows).toBe(true)
    expect(panelBottom).toBeLessThanOrEqual(viewportHeight)
    expect(lastLinkBottom).toBeLessThanOrEqual(viewportHeight)
  })

  test('stays inside the viewport at the top of the page', async () => {
    await goto('/markdown-extensions/')

    const { overflows, viewportHeight, panelBottom, lastLinkBottom } =
      await openAndMeasure()

    expect(overflows).toBe(true)
    expect(panelBottom).toBeLessThanOrEqual(viewportHeight)
    expect(lastLinkBottom).toBeLessThanOrEqual(viewportHeight)
  })
})
