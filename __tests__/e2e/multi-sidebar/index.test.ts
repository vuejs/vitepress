describe('test multi sidebar sort root', () => {
  beforeAll(async () => {
    await goto('/frontmatter/multiple-levels-outline')
  })

  test('using / sidebar', async () => {
    const sidebarLocator = page.locator(
      '.VPSidebarItem.level-0 > .item > .text'
    )

    const sidebarContent = await sidebarLocator.allTextContents()
    expect(sidebarContent).toEqual([
      'Frontmatter',
      '& <Text Literals &> code',
      'Data Loading',
      'Multi Sidebar Test',
      'Dynamic Routes',
      'Markdown Extensions'
    ])
  })

  test('collapsible sidebar headings do not contain nested buttons', async () => {
    const sidebarItem = page.locator('.VPSidebarItem.level-0').first()
    const item = sidebarItem.locator('> .item')
    const caret = item.locator('> .caret')

    expect(await item.getAttribute('role')).toBe('button')
    expect(await item.getAttribute('tabindex')).toBe('0')
    expect(await item.getAttribute('aria-expanded')).toBe('true')
    expect(await caret.getAttribute('role')).toBeNull()
    expect(await caret.getAttribute('tabindex')).toBeNull()
    expect(await caret.getAttribute('aria-hidden')).toBe('true')

    await caret.click()
    expect(await sidebarItem.getAttribute('class')).toContain('collapsed')
    expect(await item.getAttribute('aria-expanded')).toBe('false')

    await item.press('Enter')
    expect(await sidebarItem.getAttribute('class')).not.toContain('collapsed')
    expect(await item.getAttribute('aria-expanded')).toBe('true')

    await item.press(' ')
    expect(await sidebarItem.getAttribute('class')).toContain('collapsed')
    expect(await item.getAttribute('aria-expanded')).toBe('false')
  })
})

describe('test multi sidebar sort order', () => {
  beforeAll(async () => {
    await goto('/multi-sidebar/')
  })

  test('using /multi-sidebar/ sidebar', async () => {
    const sidebarLocator = page.locator(
      '.VPSidebarItem.level-0 > .item > .text'
    )

    const sidebarContent = await sidebarLocator.allTextContents()
    expect(sidebarContent).toEqual(['Multi Sidebar'])
  })
})
