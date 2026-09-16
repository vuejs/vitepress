test.runIf(process.env.VITE_TEST_BUILD)(
  'prefetches SVG links without errors and respects new-tab targets',
  async () => {
    const errors: string[] = []
    const onPageError = (error: Error) => errors.push(error.message)
    page.on('pageerror', onPageError)

    try {
      await goto('/prefetch/')

      await expect
        .poll(
          async () => ({
            errors,
            pages: await page
              .locator('link[rel="prefetch"]')
              .evaluateAll((links) =>
                links
                  .map(
                    (link) =>
                      link
                        .getAttribute('href')
                        ?.match(/prefetch_(.*?)\.md\./)?.[1]
                  )
                  .filter(Boolean)
                  .sort()
              )
          }),
          { timeout: 10_000 }
        )
        .toEqual({ errors: [], pages: ['html', 'svg', 'xlink'] })

      await page.locator('svg a[href="./svg.html"]').click()
      await page.waitForSelector('h1', { state: 'visible' })
      await expect
        .poll(() => page.locator('h1').textContent())
        .toContain('SVG link destination')
      expect(errors).toEqual([])
    } finally {
      page.off('pageerror', onPageError)
    }
  }
)
