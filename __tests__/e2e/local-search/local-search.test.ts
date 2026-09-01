describe('local search', () => {
  beforeEach(async () => {
    await goto('/')
  })

  test.runIf(!process.env.VITE_TEST_BUILD)(
    'shows progress while loading search index',
    async () => {
      const indexRoute = /@localSearchIndexroot/
      let delayedIndex = false

      await page.route(indexRoute, async (route) => {
        delayedIndex = true
        await new Promise((resolve) => setTimeout(resolve, 800))
        await route.continue()
      })

      try {
        await openSearch()

        const loading = page.locator('.search-loading')
        const results = page.locator('.results')

        await page.waitForFunction(() =>
          document
            .querySelector('.search-loading')
            ?.classList.contains('active')
        )

        expect(delayedIndex).toBe(true)
        expect(await loading.getAttribute('role')).toBe('status')
        expect(await loading.getAttribute('aria-label')).toBe(
          'Loading search results'
        )
        expect(await results.getAttribute('aria-busy')).toBe('true')

        await page.waitForFunction(
          () =>
            !document
              .querySelector('.search-loading')
              ?.classList.contains('active')
        )

        expect(await results.getAttribute('aria-busy')).toBe('false')
      } finally {
        await page.unroute(indexRoute)
      }
    }
  )

  test('exclude content from search results', async () => {
    await searchFor('local')
    await waitForSearchResults({ text: 'Local search included', count: 1 })

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

  test('resolves $frontmatter expressions in search results', async () => {
    await searchFor('Frontmatter Title Resolved')
    await waitForSearchResults({ text: 'Frontmatter Title Resolved' })

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

  test('typing replaces the persisted query', async () => {
    await searchFor('lorem')
    await waitForSearchResults({ minCount: 2 })
    await page.keyboard.press('Escape')

    // reopening restores the persisted query pre-selected, so keystrokes
    // must replace it instead of appending to it
    const input = await openSearch()
    await input.type('Frontmatter Title Resolved')
    await waitForSearchResults({ text: 'Frontmatter Title Resolved' })
    expect(await input.inputValue()).toBe('Frontmatter Title Resolved')
  })

  test('custom tokenize function reaches the client', async () => {
    // '#hash-probe' survives as one token only under the custom tokenizer —
    // MiniSearch's default one would degrade the query to 'hash'/'probe'
    // and miss the index built with the custom tokenizer
    const input = await searchFor('#hash-probe')
    await waitForSearchResults({ text: 'Local search included', count: 1 })

    // a fragment of a kept-whole token must not match anything
    await input.fill('linked-words')

    await page.waitForSelector('.no-results')
  })

  test('uses the same desktop breakpoint as the nav bar', async () => {
    try {
      for (const { width, isDesktop } of [
        { width: 767, isDesktop: false },
        { width: 768, isDesktop: true }
      ]) {
        await page.setViewportSize({ width, height: 600 })
        await goto('/')
        await openSearch()

        expect(await page.locator('.VPNavBarHamburger').isVisible()).toBe(
          !isDesktop
        )
        expect(await page.locator('.search-actions.before').isVisible()).toBe(
          !isDesktop
        )
      }
    } finally {
      await page.setViewportSize({ width: 1280, height: 720 })
    }
  })

  test('navigate results with macOS Ctrl shortcuts', async () => {
    await page.evaluate(() => document.documentElement.classList.add('mac'))

    const input = await searchFor('lorem')
    await waitForSearchResults({ minCount: 2 })

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

async function openSearch() {
  await page.locator('.VPNavBarSearchButton').click()
  return page.waitForSelector('input#localsearch-input')
}

// fills the query in one step, so exactly one search runs and the result
// list settles into the state for this query and nothing else
async function searchFor(query: string) {
  const input = await openSearch()
  await input.fill(query)
  return input
}

// waits until the result list matches, so assertions never run against the
// results of an earlier query
function waitForSearchResults(condition: {
  /** some result must contain this text */
  text?: string
  /** exactly this many results */
  count?: number
  /** at least this many results */
  minCount?: number
}) {
  return page.waitForFunction(({ text, count, minCount }) => {
    const options = [
      ...document.querySelectorAll('#localsearch-list li[role=option]')
    ]

    return (
      (count === undefined || options.length === count) &&
      (minCount === undefined || options.length >= minCount) &&
      (text === undefined ||
        options.some((option) => option.textContent?.includes(text)))
    )
  }, condition)
}

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
