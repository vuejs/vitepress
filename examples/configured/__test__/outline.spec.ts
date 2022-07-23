import { expect, test } from 'vitest'
import { page, vitePressTestUrl } from '~utils'

describe('outline', () => {
  test('set outline to deep', async () => {
    await page.goto(
      vitePressTestUrl + '/frontmatter/multiple-levels-outline.html'
    )
    const outlineLinksLocator = await page.locator(
      '.VPDocAsideOutline .root .outline-link'
    )

    await page.waitForSelector('.VPDocAsideOutline')
    const outlineLinksContent = await outlineLinksLocator.allTextContents()
    expect(outlineLinksContent).toEqual([
      'h2 - 1',
      'h3 - 1',
      'h3 - 2',
      'h2 - 2',
      'h3 - 3'
    ])

    const outlineLinks = await outlineLinksLocator.elementHandles()
    const linkHrefs = await Promise.all(
      outlineLinks.map((ele) => {
        return ele.getAttribute('href')
      })
    )
    expect(linkHrefs).toEqual(['#h2-1', '#h3-1', '#h3-2', '#h2-2', '#h3-3'])
  })
})
