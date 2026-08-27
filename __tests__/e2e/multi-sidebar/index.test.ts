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
      'Markdown Extensions',
      'Team & Sponsors',
      'Sidebar Hash'
    ])

    expect(await sidebarLocator.nth(1).innerHTML()).toBe(
      '&amp; &lt;Text Literals &amp;&gt; <code>code</code>'
    )
  })

  test('renders inline markdown in sidebar labels', async () => {
    const markdownLabel = page.locator(
      '.VPSidebarItem.level-1 a[href$="/theme-labels/"] .text'
    )

    expect(await markdownLabel.innerHTML()).toBe(
      'Markdown <code>&lt;Label &amp;&gt;</code>'
    )
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
