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

  test('navigate results with macOS Ctrl shortcuts', async () => {
    await page.evaluate(() => document.documentElement.classList.add('mac'))
    await page.locator('.VPNavBarSearchButton').click()

    const input = await page.waitForSelector('input#localsearch-input')
    await input.type('lorem')

    await page.waitForFunction(() => {
      return (
        document.querySelectorAll('#localsearch-list li[role=option]').length >
        1
      )
    })

    expect(await input.getAttribute('aria-activedescendant')).toBe(
      'localsearch-item-0'
    )

    await pressMacCtrl('n')
    expect(await input.getAttribute('aria-activedescendant')).toBe(
      'localsearch-item-1'
    )

    await pressMacCtrl('p')
    expect(await input.getAttribute('aria-activedescendant')).toBe(
      'localsearch-item-0'
    )
  })
})

function pressMacCtrl(key: string) {
  return page.evaluate((key) => {
    window.dispatchEvent(
      new KeyboardEvent('keydown', {
        key,
        ctrlKey: true,
        bubbles: true,
        cancelable: true
      })
    )
  }, key)
}
