describe('print layout', () => {
  beforeAll(async () => {
    await goto('/print/')
  })

  afterAll(async () => {
    await page.emulateMedia({ media: null })
  })

  test('lets tables and long code lines fit the printed page', async () => {
    await page.emulateMedia({ media: 'print' })

    const styles = await page.evaluate(() => {
      const table = document.querySelector('.vp-doc table')!
      const tableCode = document.querySelector('.vp-doc td code')!
      const codeBlock = document.querySelector('.vp-doc [class*="language-"]')!
      const pre = codeBlock.querySelector('pre')!
      const code = codeBlock.querySelector('code')!

      return {
        tableDisplay: getComputedStyle(table).display,
        tableOverflow: getComputedStyle(table).overflow,
        tableCodeOverflowWrap: getComputedStyle(tableCode).overflowWrap,
        codeBlockOverflow: getComputedStyle(codeBlock).overflow,
        preOverflow: getComputedStyle(pre).overflow,
        codeWhiteSpace: getComputedStyle(code).whiteSpace,
        codeOverflowWrap: getComputedStyle(code).overflowWrap
      }
    })

    expect(styles).toEqual({
      tableDisplay: 'table',
      tableOverflow: 'visible',
      tableCodeOverflowWrap: 'anywhere',
      codeBlockOverflow: 'visible',
      preOverflow: 'visible',
      codeWhiteSpace: 'pre-wrap',
      codeOverflowWrap: 'anywhere'
    })
  })
})
