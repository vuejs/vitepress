describe('test multi sidebar sort root', () => {
  beforeAll(async () => {
    await goto('/frontmatter/multiple-levels-outline')
  })

  test('using / sidebar', async () => {
    const sidebarLocator = page.locator(
      '.VPSidebarItem.level-0 > .item > .link > .text'
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
})

describe('test multi sidebar sort order', () => {
  beforeAll(async () => {
    await goto('/multi-sidebar/')
  })

  test('using /multi-sidebar/ sidebar', async () => {
    const sidebarLocator = page.locator(
      '.VPSidebarItem.level-0 > .item > .link > .text'
    )

    const sidebarContent = await sidebarLocator.allTextContents()
    expect(sidebarContent).toEqual(['Multi Sidebar'])
  })
})
