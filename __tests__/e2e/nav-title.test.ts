describe('nav title overflow', () => {
  beforeAll(async () => {
    await goto('/frontmatter/multiple-levels-outline')
  })

  test('title text does not overflow the sidebar', async () => {
    const spanBox = await page
      .locator('.VPNavBarTitle .title span')
      .boundingBox()
    const sidebarBox = await page.locator('.VPSidebar').boundingBox()

    expect(spanBox).not.toBeNull()
    expect(sidebarBox).not.toBeNull()
    expect(spanBox!.x + spanBox!.width).toBeLessThanOrEqual(
      sidebarBox!.x + sidebarBox!.width
    )
  })

  test('title text is truncated with ellipsis', async () => {
    const truncated = await page
      .locator('.VPNavBarTitle .title span')
      .evaluate((el) => el.scrollWidth > el.clientWidth)

    expect(truncated).toBe(true)
  })
})
