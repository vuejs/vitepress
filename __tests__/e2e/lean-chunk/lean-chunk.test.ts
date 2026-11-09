describe('lean chunk', () => {
  const hydrationErrors: string[] = []

  beforeAll(() => {
    page.on('console', (msg) => {
      if (/hydrat|mismatch/i.test(msg.text())) hydrationErrors.push(msg.text())
    })
  })

  beforeEach(async () => {
    hydrationErrors.length = 0
    await goto('/lean-chunk/')
    // the app attaches to its container once the initial hydration is done
    await page.waitForFunction(
      () => '__vue_app__' in document.querySelector('#app')!
    )
  })

  test('keeps every static vnode and the code around it', async () => {
    const list = page.locator('#lean-chunk-list')

    expect(await list.locator('li').count()).toBe(2)
    expect(await list.locator('p[id^="static-"]').allTextContents()).toEqual([
      'Static one.',
      'Static two.',
      'Static three.',
      'Static four.',
      'Static six.',
      'Static seven.',
      'Static eight.',
      'Static nine.'
    ])
    await expect
      .poll(() =>
        list
          .locator('img')
          .evaluateAll((imgs) =>
            imgs.map((img) => (img as HTMLImageElement).naturalWidth > 0)
          )
      )
      .toEqual([true, true])
    expect(await list.locator('.dynamic').allTextContents()).toEqual([
      'dynamic A 0',
      'dynamic B 0'
    ])
    expect(hydrationErrors).toEqual([])
  })

  test('hydrates the dynamic siblings', async () => {
    await page.locator('#increment').click()

    await expect
      .poll(() => page.locator('#lean-chunk-list .dynamic').allTextContents())
      .toEqual(['dynamic A 1', 'dynamic B 1'])
    expect(
      await page.locator('#lean-chunk-list p[id^="static-"]').count()
    ).toBe(8)
  })

  test.runIf(!!process.env.VITE_TEST_BUILD)(
    'ships the lean chunk without the static html',
    async () => {
      const html = await (await page.request.get(page.url())).text()
      const href = html.match(/href="([^"]+\.lean\.js)"/)?.[1]
      expect(href).toBeDefined()

      const lean = await (
        await page.request.get(new URL(href!, page.url()).href)
      ).text()
      expect(lean).toContain('dynamic A ')
      expect(lean).toContain('dynamic B ')
      expect(lean).not.toContain('Static one.')
      // html joined around the asset import is stripped as well
      expect(lean).not.toContain('Static ten.')
    }
  )
})
