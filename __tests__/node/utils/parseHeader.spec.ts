import { parseHeader } from 'node/utils/parseHeader'

describe('parseHeader', () => {
  test('should unescape html', () => {
    const input = `&lt;div :id=&quot;&#39;app&#39;&quot;&gt;`
    expect(parseHeader(input)).toBe(`<div :id="'app'">`)
  })

  test('should remove markdown tokens correctly', () => {
    const asserts: Record<string, string> = {
      // vuepress #238
      '[vue](vuejs.org)': 'vue',
      '`vue`': 'vue',
      '*vue*': 'vue',
      '**vue**': 'vue',
      '***vue***': 'vue',
      _vue_: 'vue',
      '\\_vue\\_': '_vue_',
      '\\*vue\\*': '*vue*',
      '\\!vue\\!': '!vue!',

      // vuepress #2688
      '[vue](vuejs.org) / [vue](vuejs.org)': 'vue / vue',
      '[\\<ins>](vuejs.org)': '<ins>',

      // vuepress #564 For multiple markdown tokens
      '`a` and `b`': 'a and b',
      '***bold and italic***': 'bold and italic',
      '**bold** and *italic*': 'bold and italic',

      // escaping \$
      '\\$vue': '$vue'
    }
    Object.keys(asserts).forEach((input) => {
      expect(parseHeader(input)).toBe(asserts[input])
    })
  })
})
