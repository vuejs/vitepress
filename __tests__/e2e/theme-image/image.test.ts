describe('themeable image alt overrides', () => {
  beforeEach(async () => {
    await goto('/theme-image/')
  })

  test.each(['light', 'dark'])('uses the alt prop in %s mode', async (mode) => {
    await page.evaluate((mode) => {
      document.documentElement.classList.toggle('dark', mode === 'dark')
    }, mode)

    expect(
      await page.locator('.image-override img:visible').getAttribute('alt')
    ).toBe('Override description')
    expect(
      await page.locator('.image-decorative img:visible').getAttribute('alt')
    ).toBe('')
    expect(
      await page.locator('.image-fallback img:visible').getAttribute('alt')
    ).toBe('Image description')
  })

  test('updates both images when the alt prop changes', async () => {
    const descriptions = () =>
      page
        .locator('.image-override img')
        .evaluateAll((images) =>
          images.map((image) => image.getAttribute('alt'))
        )

    await page.getByRole('button', { name: 'Update description' }).click()
    await expect
      .poll(descriptions)
      .toEqual(['Updated description', 'Updated description'])

    await page.getByRole('button', { name: 'Clear description' }).click()
    await expect.poll(descriptions).toEqual(['', ''])
  })
})
