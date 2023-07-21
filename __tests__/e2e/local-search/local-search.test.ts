describe('local search', () => {
  beforeEach(async () => {
    await goto('/')
    await page.locator('#local-search button').click()
  })

  test('exclude content from search results', async () => {
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
})
