import {
  isRelativeBase,
  joinPath,
  mergeHead,
  relativePathToRoot,
  type HeadConfig
} from 'shared/shared'

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

describe('shared/shared url helpers', () => {
  describe('joinPath', () => {
    test('joins and collapses slash collisions', () => {
      expect(joinPath('/', '/guide/')).toBe('/guide/')
      expect(joinPath('/docs/', '/guide/page')).toBe('/docs/guide/page')
      expect(joinPath('/docs', 'guide')).toBe('/docsguide')
    })

    test('preserves the protocol of absolute url bases', () => {
      expect(joinPath('https://cdn.example.com/', '/guide/')).toBe(
        'https://cdn.example.com/guide/'
      )
      expect(joinPath('https://cdn.example.com/sub//x/', '/a')).toBe(
        'https://cdn.example.com/sub/x/a'
      )
      expect(joinPath('//cdn.example.com/', '/a')).toBe('//cdn.example.com/a')
    })
  })

  describe('isRelativeBase', () => {
    test('only ./ is relative', () => {
      expect(isRelativeBase('./')).toBe(true)
      expect(isRelativeBase('/')).toBe(false)
      expect(isRelativeBase('/docs/')).toBe(false)
      expect(isRelativeBase('https://example.com/')).toBe(false)
    })
  })

  describe('relativePathToRoot', () => {
    test('maps a page path to its ../-prefix', () => {
      expect(relativePathToRoot('index.md')).toBe('./')
      expect(relativePathToRoot('foo.md')).toBe('./')
      expect(relativePathToRoot('guide/index.md')).toBe('../')
      expect(relativePathToRoot('guide/nested/page.md')).toBe('../../')
    })
  })
})
