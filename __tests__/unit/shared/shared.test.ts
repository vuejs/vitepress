import { mergeHead, type HeadConfig } from 'shared/shared'

describe('shared/shared', () => {
  describe('mergeHead', () => {
    test('replaces meta tags with the same key in place', () => {
      expect(
        mergeHead(
          [
            ['meta', { property: 'og:image', content: '/site.png' }],
            ['meta', { name: 'keywords', content: 'site' }]
          ],
          [['meta', { content: '/page.png', property: 'og:image' }]]
        )
      ).toEqual([
        ['meta', { content: '/page.png', property: 'og:image' }],
        ['meta', { name: 'keywords', content: 'site' }]
      ])
    })

    test('ignores content when keying meta tags', () => {
      const head: HeadConfig[] = [
        ['meta', { content: 'a', name: 'name1' }],
        ['meta', { content: 'a', name: 'name2' }]
      ]
      expect(mergeHead(head)).toEqual(head)
    })

    test('keys any element by id regardless of attribute order', () => {
      expect(
        mergeHead(
          [
            ['meta', { name: 'author', content: 'a', id: 'author-a' }],
            ['meta', { name: 'author', content: 'b', id: 'author-b' }],
            ['script', { id: 'sw' }, 'old']
          ],
          [
            ['meta', { id: 'author-a', name: 'author', content: 'c' }],
            ['script', { id: 'sw' }, 'new']
          ]
        )
      ).toEqual([
        ['meta', { id: 'author-a', name: 'author', content: 'c' }],
        ['meta', { name: 'author', content: 'b', id: 'author-b' }],
        ['script', { id: 'sw' }, 'new']
      ])
    })

    test('appends elements without a key', () => {
      const head: HeadConfig[] = [
        ['link', { rel: 'stylesheet', href: '/a.css' }],
        ['link', { rel: 'stylesheet', href: '/a.css' }]
      ]
      expect(mergeHead(head, head)).toEqual([...head, ...head])
    })
  })
})
