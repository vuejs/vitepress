describe('render correct content', async () => {
  beforeAll(async () => {
    await goto('/home')
  })

  test('main content', async () => {
    const h1Locator = page.locator('.VPContent h1')
    const h2Locator = page.locator('.VPContent h2')
    const pLocator = page.locator('.VPContent p')

    const [h1Contents, h2Contents, pContents] = await Promise.all([
      h1Locator.allTextContents(),
      h2Locator.allTextContents(),
      pLocator.allTextContents()
    ])

    expect(h1Contents).toEqual(['Lorem Ipsum \u200b'])
    expect(h2Contents.map((s) => s.trim())).toEqual([
      'What is Lorem Ipsum? \u200b',
      'Where does it come from? \u200b',
      'Why do we use it? \u200b',
      'Where can I get some? \u200b'
    ])
    expect(pContents).toMatchSnapshot()
  })

  test('outline', async () => {
    const outlineLinksLocator = page.locator(
      '.VPDocAsideOutline .root .outline-link'
    )

    const outlineLinksCount = await outlineLinksLocator.count()
    expect(outlineLinksCount).toEqual(4)
  })
})
