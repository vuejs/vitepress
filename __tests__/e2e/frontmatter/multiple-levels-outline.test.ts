describe('outline', () => {
  beforeAll(async () => {
    await goto('/frontmatter/multiple-levels-outline')
  })

  test('set outline to deep', async () => {
    const outlineLinksLocator = page.locator('.VPDocAsideOutline .outline-link')

    const outlineLinksContent = await outlineLinksLocator.allTextContents()
    expect(outlineLinksContent).toEqual([
      'h2 - 1',
      'h3 - 1',
      'h4 - 1',
      'h3 - 2',
      'h4 - 2',
      'h2 - 2',
      'h3 - 3',
      'h4 - 3'
    ])

    const linkHrefs = await outlineLinksLocator.evaluateAll((element) =>
      element.map((element) => element.getAttribute('href'))
    )

    expect(linkHrefs).toEqual([
      '#h2-1',
      '#h3-1',
      '#h4-1',
      '#h3-2',
      '#h4-2',
      '#h2-2',
      '#h3-3',
      '#h4-3'
    ])
  })

  test('closes the local nav dropdown when the link text is clicked', async () => {
    await page.setViewportSize({ width: 960, height: 720 })
    try {
      await goto('/frontmatter/multiple-levels-outline')
      const button = page.locator('.VPLocalNavOutlineDropdown > button')
      await button.click()
      await expect.poll(() => button.getAttribute('aria-expanded')).toBe('true')

      // click the <bdi> holding the text, not the padding of the link
      await page
        .locator('.VPLocalNavOutlineDropdown .outline-link[href="#h3-2"] bdi')
        .click()
      await expect
        .poll(() => button.getAttribute('aria-expanded'))
        .toBe('false')
      expect(new URL(page.url()).hash).toBe('#h3-2')
    } finally {
      await page.setViewportSize({ width: 1280, height: 720 })
    }
  })
})
