describe('local search', () => {
  beforeEach(async () => {
    await goto('/')
  })

  test('exclude content from search results', async () => {
    await page.locator('.VPNavBarSearchButton').click()

    const input = await page.waitForSelector('input#localsearch-input')
    await input.type('local')

    await page.waitForSelector('ul#localsearch-list', { state: 'visible' })

    const searchResults = page.locator('#localsearch-list')
    expect(await searchResults.locator('li[role=option]').count()).toBe(1)

    expect(
      await searchResults.filter({ hasText: 'Local search included' }).count()
    ).toBe(1)

    expect(
      await searchResults.filter({ hasText: 'Local search excluded' }).count()
    ).toBe(0)

    expect(
      await searchResults
        .filter({ hasText: 'Local search frontmatter excluded' })
        .count()
    ).toBe(0)
  })

  test('resolve $frontmatter expressions in search results', async () => {
    await page.locator('.VPNavBarSearchButton').click()

    const input = await page.waitForSelector('input#localsearch-input')

    await input.type('Frontmatter Title Resolved')
    await page.waitForSelector('ul#localsearch-list', { state: 'visible' })

    const searchResults = page.locator('#localsearch-list')

    expect(
      await searchResults
        .filter({ hasText: 'Frontmatter Title Resolved' })
        .count()
    ).toBe(1)
    expect(
      await searchResults.filter({ hasText: '$frontmatter.title' }).count()
    ).toBe(0)
  })
})
