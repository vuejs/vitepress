describe('sidebar', () => {
  beforeAll(async () => {
    await goto('/frontmatter/multiple-levels-outline')
  })

  test('collapsible group renders a heading and a single toggle button', async () => {
    const group = page.locator('.VPSidebarItem.level-0.collapsible').first()
    const caret = group.locator('.caret').first()

    expect(await page.locator('.VPSidebarItem [role="button"]').count()).toBe(0)
    expect(await caret.evaluate((el) => el.tagName)).toBe('BUTTON')
    expect(await caret.getAttribute('aria-expanded')).toBe('true')
  })

  test('group toggles with keyboard, caret and heading', async () => {
    const group = page.locator('.VPSidebarItem.level-0.collapsible').first()
    const caret = group.locator('.caret').first()
    const isCollapsed = () =>
      group.evaluate((el) => el.classList.contains('collapsed'))

    await caret.focus()
    await page.keyboard.press('Enter')
    expect(await isCollapsed()).toBe(true)
    expect(await caret.getAttribute('aria-expanded')).toBe('false')

    await page.keyboard.press('Space')
    expect(await isCollapsed()).toBe(false)
    expect(await caret.getAttribute('aria-expanded')).toBe('true')

    await caret.click()
    expect(await isCollapsed()).toBe(true)

    await group.locator('.text').first().click()
    expect(await isCollapsed()).toBe(false)
  })
})
