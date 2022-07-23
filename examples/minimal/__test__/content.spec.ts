import { expect, test } from 'vitest'
import { page, vitePressTestUrl } from '~utils'

test('should have correct main content', async () => {
  await page.goto(vitePressTestUrl)
  const h1Locator = await page.locator('h1')
  const h2Locator = await page.locator('h2')
  const pLocator = await page.locator('h1 ~ p')

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

test('should have correct outline', async () => {
  await page.goto(vitePressTestUrl)
  const outlineLinksLocator = await page.locator(
    '.VPDocAsideOutline .root .outline-link'
  )

  const outlineLinksContent = await outlineLinksLocator.allTextContents()
  expect(outlineLinksContent).toEqual([
    'What is Lorem Ipsum?',
    'Where does it come from?',
    'Why do we use it?',
    'Where can I get some?'
  ])

  const outlineLinks = await outlineLinksLocator.elementHandles()
  const linkHrefs = await Promise.all(
    outlineLinks.map((ele) => {
      return ele.getAttribute('href')
    })
  )
  expect(linkHrefs).toEqual([
    '#what-is-lorem-ipsum',
    '#where-does-it-come-from',
    '#why-do-we-use-it',
    '#where-can-i-get-some'
  ])
})
