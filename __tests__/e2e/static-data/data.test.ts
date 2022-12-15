describe('static data file support in vite 3', () => {
  beforeAll(async () => {
    await goto('/static-data/data')
  })

  test('render correct content', async () => {
    const pLocator = page.locator('.VPContent p')

    const pContents = await pLocator.allTextContents()
    expect(pContents).toMatchSnapshot()
  })
})
