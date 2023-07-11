beforeEach(async () => {
  await goto('/')
})

describe('Local search', () => {
  test('exclude content from search results', async () => {
    await page.locator('#local-search button').click()

    const input = await page.locator('input#localsearch-input')
    await input.waitFor({ state: 'visible' })
    await input.type('local')

    await page.waitForSelector('ul#localsearch-list', { state: 'visible' })

    const searchResults = await page.locator('#localsearch-list')
    expect(await searchResults.locator('li[role=option]').count()).toBe(1)

    await searchResults.filter({ hasText: 'Local search included' }).isVisible()

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
