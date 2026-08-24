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

  test('nav landmarks and controls have accessible names', async () => {
    await goto('/')

    expect(await page.locator('.VPNavBarMenu').getAttribute('aria-label')).toBe(
      'Main Navigation'
    )

    await page.setViewportSize({ width: 375, height: 667 })
    expect(
      await page.locator('.VPNavBarHamburger').getAttribute('aria-label')
    ).toBe('Menu')
  })

  test('dropdown group is a keyboard-dismissible disclosure', async () => {
    await goto('/')

    const button = page.locator('.VPNavBarMenuGroup').first().locator('button')
    expect(await button.getAttribute('aria-expanded')).toBe('false')

    await button.click()
    expect(await button.getAttribute('aria-expanded')).toBe('true')

    await page.keyboard.press('Escape')
    expect(await button.getAttribute('aria-expanded')).toBe('false')

    // focus returned to the trigger
    expect(
      await page.evaluate(() => document.activeElement?.textContent)
    ).toContain('API Reference')
  })

  test('dropdown closes after navigating via a menu item', async () => {
    await goto('/')

    const group = page.locator('.VPNavBarMenuGroup').first()
    await group.locator('button').click()
    await group.locator('a[href="/home.html"]').click()
    await page.waitForFunction(() => location.pathname.endsWith('/home.html'))

    // the route watcher closes it on the post-navigation tick
    await page.waitForSelector(
      '.VPNavBarMenuGroup button[aria-expanded="false"]'
    )
  })

  test('overflowing nav items move into the extra menu instead of clipping', async () => {
    await goto('/')

    // everything fits at 1280, so the ⋯ menu isn't rendered at all
    expect(await page.locator('.VPNavBarExtra').count()).toBe(0)

    // inflate the items so none of them can possibly fit
    const style = await page.addStyleTag({
      content: '.VPNavBarMenu .list > li > * { padding: 0 500px !important }'
    })
    await page.waitForSelector('.VPNavBarExtra')

    // every control that stays in the bar remains fully within the viewport
    // (no clipped/unreachable items — the failure mode of #2842)
    expect(
      await page.evaluate(() => {
        const targets = [
          ...document.querySelectorAll('.VPNavBarMenu .list > li'),
          document.querySelector('.VPNavBarSearch button'),
          document.querySelector('.VPNavBarExtra > button')
        ].filter((el): el is HTMLElement => !!el)
        return targets.every((el) => {
          const rect = el.getBoundingClientRect()
          return rect.left >= -1 && rect.right <= innerWidth + 1
        })
      })
    ).toBe(true)

    // collapsed items and social links are reachable through the ⋯ menu
    // (the scoped selector targets the moved "Home" item itself — the
    // version-switcher component in the menu also links to "/")
    await page.locator('.VPNavBarExtra > button').click()
    await page.waitForSelector(
      '.VPNavBarExtra .overflow-items > .VPMenuLink a[href="/"]'
    )
    await page.waitForSelector('.VPNavBarExtra .social-links')

    // widening back restores the inline items and removes the ⋯ menu
    await page.evaluate((el) => el.remove(), style)
    await page.waitForSelector('.VPNavBarExtra', { state: 'detached' })
    await page.waitForSelector('.VPNavBarMenuLink[href="/"]')
  })

  test('nav screen manages focus and inert state', async () => {
    await page.setViewportSize({ width: 375, height: 667 })
    await goto('/')

    const hamburger = page.locator('.VPNavBarHamburger')
    expect(await hamburger.getAttribute('aria-expanded')).toBe('false')

    await hamburger.click()
    await page.waitForSelector('#VPNavScreen')
    expect(await hamburger.getAttribute('aria-expanded')).toBe('true')

    // the covered page content is inert while the screen is open
    expect(
      await page.evaluate(() =>
        document.getElementById('VPContent')!.hasAttribute('inert')
      )
    ).toBe(true)

    await page.keyboard.press('Escape')
    await page.waitForSelector('#VPNavScreen', { state: 'detached' })

    expect(
      await page.evaluate(() =>
        document.getElementById('VPContent')!.hasAttribute('inert')
      )
    ).toBe(false)

    // focus returned to the hamburger
    expect(
      await page.evaluate(() => document.activeElement?.className)
    ).toContain('VPNavBarHamburger')
  })

  test('screen menu group is a real disclosure', async () => {
    await page.setViewportSize({ width: 375, height: 667 })
    await goto('/')
    await page.locator('.VPNavBarHamburger').click()

    const group = page.locator('.VPNavScreenMenuGroup').first()
    const button = group.locator('button').first()

    expect(await button.getAttribute('aria-expanded')).toBe('false')
    // collapsed content is hidden from view and the tab order
    expect(await group.locator('a[href="/home.html"]').isVisible()).toBe(false)

    await button.click()
    expect(await button.getAttribute('aria-expanded')).toBe('true')
    await page.waitForSelector('.VPNavScreenMenuGroup a[href="/home.html"]')

    // aria-controls points at the panel it toggles
    const controls = await button.getAttribute('aria-controls')
    expect(await group.locator(`ul[id="${controls}"]`).count()).toBe(1)
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
