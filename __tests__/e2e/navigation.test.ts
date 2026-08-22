describe('navigation accessibility', () => {
  test('marks direct navigation links to the current page', async () => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await goto('/')

    const desktopCurrentLink = page.locator('.VPNavBarMenuLink[href="/"]')
    expect(await desktopCurrentLink.getAttribute('aria-current')).toBe('page')

    await page.setViewportSize({ width: 375, height: 667 })
    await page.locator('.VPNavBarHamburger').click()

    const mobileCurrentLink = page.locator('.VPNavScreenMenuLink[href="/"]')
    expect(await mobileCurrentLink.getAttribute('aria-current')).toBe('page')
  })

  test('marks nested navigation links to the current page', async () => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await goto('/home')

    const desktopCurrentLink = page.locator('.VPMenuLink a[href="/home.html"]')
    const inactiveLink = page.locator('.VPNavBarMenuLink[href="/"]')

    expect(await desktopCurrentLink.getAttribute('aria-current')).toBe('page')
    expect(await inactiveLink.getAttribute('aria-current')).toBeNull()

    await page.setViewportSize({ width: 375, height: 667 })
    await page.locator('.VPNavBarHamburger').click()

    const mobileCurrentLink = page.locator(
      '.VPNavScreenMenuGroupLink[href="/home.html"]'
    )
    expect(await mobileCurrentLink.getAttribute('aria-current')).toBe('page')
  })

  test('marks the current sidebar link', async () => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await goto('/frontmatter/multiple-levels-outline')

    const currentLink = page.locator('.VPSidebarItem.is-active .link')
    const inactiveLink = page.locator(
      '.VPSidebarItem:not(.is-active) > .item > .link'
    )

    expect(await currentLink.getAttribute('aria-current')).toBe('page')
    expect(await inactiveLink.first().getAttribute('aria-current')).toBeNull()
  })
})
