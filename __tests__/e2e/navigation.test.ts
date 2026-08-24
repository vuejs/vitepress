const ariaCurrent = (selector: string) =>
  page.locator(selector).getAttribute('aria-current')

describe('navigation accessibility', () => {
  beforeEach(async () => {
    await page.setViewportSize({ width: 1280, height: 720 })
  })

  test('marks direct nav links to the current page', async () => {
    await goto('/')

    expect(await ariaCurrent('.VPNavBarMenuLink[href="/"]')).toBe('page')

    await page.setViewportSize({ width: 375, height: 667 })
    await page.locator('.VPNavBarHamburger').click()

    expect(await ariaCurrent('.VPNavScreenMenuLink[href="/"]')).toBe('page')
  })

  test('marks nested nav links to the current page', async () => {
    await goto('/home')

    expect(await ariaCurrent('.VPMenuLink a[href="/home.html"]')).toBe('page')
    expect(await ariaCurrent('.VPNavBarMenuLink[href="/"]')).toBeNull()

    await page.setViewportSize({ width: 375, height: 667 })
    await page.locator('.VPNavBarHamburger').click()

    expect(
      await ariaCurrent('.VPNavScreenMenuGroupLink[href="/home.html"]')
    ).toBe('page')
  })

  test('does not mark broad activeMatch links as current', async () => {
    await goto('/home')

    const sectionLink = page.locator(
      '.VPNavBarMenuLink[href="/markdown-extensions/"]'
    )

    expect(await sectionLink.getAttribute('class')).toContain('active')
    expect(await sectionLink.getAttribute('aria-current')).toBeNull()
  })

  test('marks only exact sidebar links, including fragments', async () => {
    const overview = '.VPSidebarItem .link[href="/sidebar-hash/"]'
    const sectionOne = '.VPSidebarItem .link[href="/sidebar-hash/#section-one"]'
    const sectionTwo = '.VPSidebarItem .link[href="/sidebar-hash/#section-two"]'

    await goto('/sidebar-hash/')

    // wait for hydration to replace the hash-agnostic server-rendered state
    await page.waitForFunction(
      () => document.querySelectorAll('.VPSidebarItem.is-active').length === 1
    )

    expect(await ariaCurrent(overview)).toBe('page')
    expect(await ariaCurrent(sectionOne)).toBeNull()
    expect(await ariaCurrent(sectionTwo)).toBeNull()

    await page.locator(sectionTwo).click()
    await page.waitForSelector(`${sectionTwo}[aria-current="page"]`)
    expect(await ariaCurrent(sectionOne)).toBeNull()

    await page.locator(sectionOne).click()
    await page.waitForSelector(`${sectionOne}[aria-current="page"]`)
    expect(await ariaCurrent(sectionTwo)).toBeNull()
  })

  test.runIf(process.env.VITE_TEST_BUILD)(
    'omits aria-current for fragment links in server-rendered HTML',
    async () => {
      const response = await page.request.get(
        `http://localhost:${process.env['PORT']}/sidebar-hash/`
      )
      const anchors = (
        (await response.text()).match(/<a\b[^>]*>/g) ?? []
      ).filter((anchor) => anchor.includes('/sidebar-hash/'))

      expect(
        anchors.filter((anchor) => anchor.includes('#section-')).length
      ).toBeGreaterThanOrEqual(2)
      expect(
        anchors.filter((anchor) => anchor.includes('aria-current'))
      ).toEqual([expect.stringContaining('href="/sidebar-hash/"')])
    }
  )
})
