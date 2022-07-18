import { beforeAll, expect, test } from 'vitest'
import { page, waitForLayout } from '~utils'

describe('render corrent content', () => {
  beforeAll(async () => {
    await waitForLayout()
  })

  test('main content', async () => {
    const h1Locator = await page.locator('h1')
    const h2Locator = await page.locator('h2')
    const pLocator = await page.locator('.Layout p')

    const [h1Contents, h2Conetents, pContents] = await Promise.all([
      h1Locator.allTextContents(),
      h2Locator.allTextContents(),
      pLocator.allTextContents()
    ])

    expect(h1Contents).toEqual(['Lorem Ipsum #'])
    expect(h2Conetents).toEqual([
      'What is Lorem Ipsum? #',
      'Where does it come from? #',
      'Why do we use it? #',
      'Where can I get some? #'
    ])
    expect(pContents).toMatchSnapshot()
  })

  test('outline', async () => {
    const outlineLinksLocator = await page.locator(
      '.VPDocAsideOutline .root .outline-link'
    )

    const outlineLinksCount = await outlineLinksLocator.count()
    expect(outlineLinksCount).toEqual(0)
  })
})
