import { expect, test } from 'vitest'
import { page, vitePressTestUrl, waitForLayout } from '~utils'

describe('outline', () => {
  beforeAll(async () => {
    await page.goto(
      vitePressTestUrl + '/frontmatter/multiple-levels-outline.html'
    )
    await waitForLayout()
  })

  test('set outline to deep', async () => {
    const outlineLinksLocator = await page.locator(
      '.VPDocAsideOutline .root .outline-link'
    )

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
})
