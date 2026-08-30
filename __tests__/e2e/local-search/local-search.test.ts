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
        await page.locator('.VPNavBarSearchButton').click()

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
    await page.locator('.VPNavBarSearchButton').click()

    const input = await page.waitForSelector('input#localsearch-input')
    await input.type('local')

    const searchResults = page.locator('#localsearch-list')
    await page.waitForFunction(() => {
      const options = [
        ...document.querySelectorAll('#localsearch-list li[role=option]')
      ]

      return (
        options.length === 1 &&
        options[0].textContent?.includes('Local search included')
      )
    })

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
    await page.locator('.VPNavBarSearchButton').click()

    const input = await page.waitForSelector('input#localsearch-input')
    await input.fill('Frontmatter Title Resolved')

    const searchResults = page.locator('#localsearch-list')
    await page.waitForFunction(() => {
      const options = [
        ...document.querySelectorAll('#localsearch-list li[role=option]')
      ]

      return options.some((option) =>
        option.textContent?.includes('Frontmatter Title Resolved')
      )
    })

    expect(
      await searchResults
        .filter({ hasText: 'Frontmatter Title Resolved' })
        .count()
    ).toBe(1)
    expect(
      await searchResults.filter({ hasText: '$frontmatter.title' }).count()
    ).toBe(0)
  })

  test('custom tokenize function reaches the client', async () => {
    await page.locator('.VPNavBarSearchButton').click()

    const input = await page.waitForSelector('input#localsearch-input')

    // '#hash-probe' survives as one token only under the custom tokenizer —
    // MiniSearch's default one would degrade the query to 'hash'/'probe'
    // and miss the index built with the custom tokenizer
    await input.type('#hash-probe')

    await page.waitForFunction(() => {
      const options = [
        ...document.querySelectorAll('#localsearch-list li[role=option]')
      ]

      return (
        options.length === 1 &&
        options[0].textContent?.includes('Local search included')
      )
    })

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
        await page.locator('.VPNavBarSearchButton').click()
        await page.waitForSelector('input#localsearch-input')

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
