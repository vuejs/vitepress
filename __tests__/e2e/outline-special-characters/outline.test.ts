const anchors = [
  ['Regular anchor', 'regular'],
  ['Quoted anchor', 'quoted"anchor'],
  ['Percent anchor', '100%'],
  ['Literal escape', 'literal%61text'],
  ['Decoded escape', 'literalatext'],
  ['Unicode anchor', '你好'],
  ['Backslash anchor', 'back\\slash']
] as const

describe('outline with special characters', () => {
  const errors: string[] = []
  const onPageError = (error: Error) => errors.push(error.message)

  beforeAll(async () => {
    await page.setViewportSize({ width: 1440, height: 900 })
    page.on('pageerror', onPageError)
  })

  afterAll(() => page.off('pageerror', onPageError))

  beforeEach(async () => {
    errors.length = 0
    await goto('/outline-special-characters/')
    await page.waitForFunction(
      () =>
        document.querySelectorAll('.VPDocAsideOutline .outline-link').length ===
        7
    )
  })

  test.each(anchors)('tracks %s when scrolling', async (title, id) => {
    await page.evaluate((id) => {
      document.getElementById(id)!.scrollIntoView()
    }, id)
    await expect
      .poll(() => page.locator('.VPDocAsideOutline .active').allTextContents())
      .toEqual([title])
    expect(errors).toEqual([])
  })

  test.each(anchors)('navigates to %s', async (title, id) => {
    await page
      .locator('.VPDocAsideOutline .outline-link')
      .getByText(title, { exact: true })
      .click()
    await expect
      .poll(() => page.evaluate(() => document.activeElement?.id))
      .toBe(id)
    await expect
      .poll(() => page.locator('.VPDocAsideOutline .active').allTextContents())
      .toEqual([title])
    expect(errors).toEqual([])
  })

  test('activates a deep link with lowercase percent escapes', async () => {
    await goto('/outline-special-characters/#%e4%bd%a0%e5%a5%bd')
    await expect
      .poll(() => page.locator('.VPDocAsideOutline .active').allTextContents())
      .toEqual(['Unicode anchor'])
    expect(errors).toEqual([])
  })
})
