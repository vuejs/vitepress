import {
  createTitle,
  isRelativeBase,
  joinPath,
  mergeHead,
  pageChunkPath,
  relativePathToRoot,
  tokenizeSearchText,
  type HeadConfig,
  type PageData,
  type SiteData
} from 'shared/shared'

describe('shared/shared', () => {
  describe('pageChunkPath', () => {
    test('keeps flat chunks directly in assetsDir', () => {
      expect(pageChunkPath('guide_foo.md', 'Ab-12xyz')).toBe(
        'guide_foo.md.Ab-12xyz.js'
      )
    })

    test('prefixes the shard recorded in the hash map entry', () => {
      expect(pageChunkPath('guide_foo.md', '3/Ab-12xyz')).toBe(
        '3/guide_foo.md.Ab-12xyz.js'
      )
      expect(pageChunkPath('guide_foo.md', '3/Ab-12xyz', '.lean.js')).toBe(
        '3/guide_foo.md.Ab-12xyz.lean.js'
      )
    })
  })

  describe('createTitle', () => {
    test('inserts titles containing $ literally into :title templates', () => {
      const site = { title: 'Site', titleTemplate: ':title - Docs' }
      const page = { title: 'Using $& and $$ in Bash' }
      expect(createTitle(site as SiteData, page as PageData)).toBe(
        'Using $& and $$ in Bash - Docs'
      )
    })
  })

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

  describe('tokenizeSearchText', () => {
    const tokens = (text: string) => tokenizeSearchText(text).filter(Boolean)

    test('splits on spaces and punctuation like the MiniSearch default', () => {
      for (const text of [
        "Hello, world! don't stop-me 3.14",
        'Привет, мир',
        '한국어 검색 기능',
        'line\nbreak\r\nand\u00a0nbsp'
      ]) {
        expect(tokenizeSearchText(text)).toEqual(
          text.split(/[\n\r\p{Z}\p{P}]+/u)
        )
      }
    })

    test('segments Chinese words', () => {
      expect(tokens('全文搜索引擎很好用')).toEqual([
        '全文',
        '搜索',
        '引擎',
        '很好',
        '用'
      ])
    })

    test('segments Japanese words', () => {
      expect(tokens('日本語の検索機能を改善する')).toEqual([
        '日本語',
        'の',
        '検索',
        '機能',
        'を',
        '改善',
        'する'
      ])
    })

    test('keeps non-CJK words in mixed text', () => {
      expect(tokens('Vue3是框架,hello-world')).toEqual([
        'Vue3',
        '是',
        '框架',
        'hello',
        'world'
      ])
    })

    test('keeps symbols and emoji next to CJK text', () => {
      expect(tokenizeSearchText('C++入門')).toEqual(['C++', '入門'])
      expect(tokenizeSearchText('👩‍💻日本語ガイド')).toEqual([
        '👩‍💻',
        '日本語',
        'ガイド'
      ])
      expect(tokenizeSearchText('Vue3の使い方')).toEqual([
        'Vue3',
        'の',
        '使い方'
      ])
    })

    test('never changes the non-CJK parts of the text', () => {
      const cjk = /[\p{scx=Han}\p{scx=Hiragana}\p{scx=Katakana}]/u
      for (const text of [
        'C++入門',
        '👩‍💻日本語ガイド',
        'Vue3の使い方',
        "v1.2.3は安定版、don't",
        'a=b+c 検索 x*y'
      ]) {
        // the old tokenizer on the text with the CJK characters removed
        const old = text
          .replace(new RegExp(cjk.source, 'gu'), ' ')
          .split(/[\n\r\p{Z}\p{P}]+/u)
          .filter(Boolean)
        expect(tokens(text).filter((term) => !cjk.test(term))).toEqual(old)
      }
    })

    test('never emits empty strings for words containing CJK', () => {
      expect(tokenizeSearchText('C++入門')).not.toContain('')
      expect(tokenizeSearchText('👩‍💻日本語')).not.toContain('')
    })

    test('falls back to the default split without Intl.Segmenter', () => {
      vi.stubGlobal('Intl', { ...Intl, Segmenter: undefined })
      try {
        expect(tokens('全文搜索 hello')).toEqual(['全文搜索', 'hello'])
      } finally {
        vi.unstubAllGlobals()
      }
    })
  })
})
