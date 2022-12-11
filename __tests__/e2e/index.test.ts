describe('render correct content', async () => {
  beforeAll(async () => {
    await goto('/')
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

    expect(h1Contents).toEqual(['Lorem Ipsum #'])
    expect(h2Contents).toEqual([
      'What is Lorem Ipsum? #',
      'Where does it come from? #',
      'Why do we use it? #',
      'Where can I get some? #'
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
