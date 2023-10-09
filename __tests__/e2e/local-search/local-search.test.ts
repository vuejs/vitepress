const getSearchResults = async (text: string) => {
  await page.locator('#local-search button').click()

  const input = await page.waitForSelector('input#localsearch-input')
  await input.fill(text)

  await page.waitForSelector('ul#localsearch-list', { state: 'visible' })

  return page.locator('#localsearch-list')
}

describe('local search', () => {
  beforeEach(async () => {
    await goto('/')
  })

  test('exclude content from search results', async () => {
    const searchResults = await getSearchResults('local')

    expect(await searchResults.locator('li[role=option]').count()).toBe(2)

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

  test('frontmatter content from search results', async () => {
    const searchResults = await getSearchResults('local')

    expect(
      await searchResults
        .filter({ hasText: 'Local search frontmatter title' })
        .count()
    ).toBe(1)
  })
})
