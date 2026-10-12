describe('client components', () => {
  beforeEach(async () => {
    await goto('/client-component/')
    await page.waitForSelector('#forwarded.client-component')
  })

  test('forwards default and scoped slots and keeps them reactive', async () => {
    const header = page.locator('#forwarded header')
    const content = page.locator('#forwarded .default-slot')

    expect(await header.textContent()).toBe('scoped value 0')
    expect((await content.textContent())?.trim()).toBe('default content 0')
    expect(await page.locator('#forwarded footer').textContent()).toBe('')

    await page.locator('#increment').click()

    await expect.poll(() => header.textContent()).toBe('scoped value 1')
    expect((await content.textContent())?.trim()).toBe('default content 1')
    expect(await page.locator('#forwarded footer').textContent()).toBe(
      'conditional slot'
    )

    await page.locator('#increment').click()

    await expect.poll(() => header.textContent()).toBe('scoped value 2')
    expect(await page.locator('#forwarded footer').textContent()).toBe('')
  })

  test('forwards slots when args only provide props', async () => {
    expect(await page.locator('#with-props header').textContent()).toBe(
      'from args'
    )
    expect(
      (await page.locator('#with-props .default-slot').textContent())?.trim()
    ).toBe('content with props')
    expect(await page.locator('#empty-args .default-slot').textContent()).toBe(
      'content with empty args'
    )
    expect(await page.locator('#null-props .default-slot').textContent()).toBe(
      'content with null props'
    )
  })

  test('preserves explicitly provided slots and shorthand children', async () => {
    expect(await page.locator('#explicit header').textContent()).toBe(
      'explicit header'
    )
    expect(await page.locator('#explicit .default-slot').textContent()).toBe(
      'explicit default'
    )

    for (const [id, content] of [
      ['string', 'string child'],
      ['array', 'array child'],
      ['vnode', 'vnode child'],
      ['function', 'function child'],
      ['number', '42'],
      ['null', 'default fallback'],
      ['undefined', 'default fallback'],
      ['multiple', 'firstsecond']
    ]) {
      expect(
        await page.locator(`#legacy-${id} .default-slot`).textContent()
      ).toBe(content)
    }
  })

  test.runIf(!!process.env.VITE_TEST_BUILD)(
    'does not render the component or its slots on the server',
    async () => {
      const response = await page.request.get(page.url())
      const html = await response.text()

      expect(html).not.toContain('class="client-component"')
      expect(html).not.toContain('default content 0')
    }
  )
})
