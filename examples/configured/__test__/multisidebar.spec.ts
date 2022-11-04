import { expect, test } from 'vitest'
import { page, vitePressTestUrl, waitForLayout } from '~utils'

describe('test multi sidebar sort root', () => {
  beforeAll(async () => {
    await page.goto(
      vitePressTestUrl + '/frontmatter/multiple-levels-outline.html'
    )
    await waitForLayout()
  })

  test('using / sidebar', async () => {
    const sidebarLocator = await page.locator(
      '.VPSidebarGroup .title .title-text'
    )

    const sidebarContent = await sidebarLocator.allTextContents()
    expect(sidebarContent).toEqual([
      'Frontmatter',
      '& <Text Literals &> code',
      'Static Data',
      'Multi Sidebar Test'
    ])
  })
})

describe('test multi sidebar sort other', () => {
  beforeAll(async () => {
    await page.goto(vitePressTestUrl + '/multi-sidebar/index.html')
    await waitForLayout()
  })

  test('using /multi-sidebar/ sidebar', async () => {
    const sidebarLocator = await page.locator(
      '.VPSidebarGroup .title .title-text'
    )

    const sidebarContent = await sidebarLocator.allTextContents()
    expect(sidebarContent).toEqual(['Multi Sidebar'])
  })
})
