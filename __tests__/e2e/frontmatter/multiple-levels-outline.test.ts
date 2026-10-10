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

  test(
    'keeps the outline dropdown inside the viewport after scrolling',
    async () => {
      await page.setViewportSize({ width: 1187, height: 883 })
      await page.evaluate(async () => {
        const filler = document.createElement('div')
        filler.style.height = '1200px'
        document.body.append(filler)
        document.documentElement.style.scrollBehavior = 'auto'
        window.scrollTo(0, 300)
        await new Promise(requestAnimationFrame)
      })

      expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0)
      await page.locator('.VPLocalNavOutlineDropdown > button').click()
      const result = await page
        .locator('.VPLocalNavOutlineDropdown .items')
        .evaluate((items) => {
          items.style.transition = 'none'
          const outline = items.querySelector('.outline')!
          let lastLink!: HTMLAnchorElement
          for (let i = 0; i < 30; i++) {
            lastLink = document.createElement('a')
            lastLink.className = 'outline-link'
            lastLink.href = `#generated-${i}`
            lastLink.textContent = `Generated heading ${i}`
            lastLink.style.cssText = 'display: block; height: 2rem'
            outline.append(lastLink)
          }
          items.scrollTop = items.scrollHeight
          const rect = lastLink.getBoundingClientRect()
          const hit =
            document.elementFromPoint(rect.left + 4, rect.top + 4)?.closest('a') ===
            lastLink
          return { bottom: rect.bottom, hit }
        })

      expect(result.bottom).toBeLessThanOrEqual(883)
      expect(result.hit).toBe(true)
      await page.setViewportSize({ width: 1280, height: 720 })
    }
  )
})
