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

  test('social link target override', async () => {
    const socialLink = page.locator(
      '.VPNavBarSocialLinks a[aria-label="Home social link"]'
    )

    expect(await socialLink.getAttribute('href')).toBe('/home')
    expect(await socialLink.getAttribute('target')).toBe('_self')
  })
})

describe('homepage edit link', async () => {
  test('shows edit link on homepage when index option is enabled', async () => {
    await goto('/')

    const editLink = page.locator('.VPHome .edit-link-button')

    expect(await editLink.isVisible()).toBe(true)
    expect(await editLink.textContent()).toContain('Edit this page on GitHub')
    expect(await editLink.getAttribute('href')).toBe(
      'https://github.com/vuejs/vitepress/edit/main/docs/index.md'
    )
  })

  test('does not show edit link on non-index home layout pages', async () => {
    await goto('/team-and-sponsors/home')

    const editLink = page.locator('.VPHome .edit-link-button')

    expect(await editLink.count()).toBe(0)
  })

  test('keeps edit link on regular documentation pages', async () => {
    await goto('/home')

    const editLink = page.locator('.VPDocFooter .edit-link-button')

    expect(await editLink.isVisible()).toBe(true)
    expect(await editLink.textContent()).toContain('Edit this page on GitHub')
  })
})
