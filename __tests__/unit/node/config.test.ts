import { normalizeAssetsBase, normalizeSiteBase } from 'node/config'

describe('node/config', () => {
  describe('normalizeSiteBase', () => {
    test('defaults to / and appends the trailing slash', () => {
      expect(normalizeSiteBase(undefined)).toBe('/')
      expect(normalizeSiteBase('')).toBe('/')
      expect(normalizeSiteBase('/docs')).toBe('/docs/')
      expect(normalizeSiteBase('/docs/')).toBe('/docs/')
    })

    test('normalizes relative forms to ./', () => {
      expect(normalizeSiteBase('.')).toBe('./')
      expect(normalizeSiteBase('./')).toBe('./')
    })

    test('rejects relative bases with a subpath', () => {
      expect(() => normalizeSiteBase('./docs/')).toThrow(/relative base/)
      expect(() => normalizeSiteBase('../x')).toThrow(/relative base/)
    })
  })

  describe('normalizeAssetsBase', () => {
    test('accepts absolute urls, protocol-relative urls and paths', () => {
      expect(normalizeAssetsBase('https://cdn.example.com')).toBe(
        'https://cdn.example.com/'
      )
      expect(normalizeAssetsBase('//cdn.example.com/x')).toBe(
        '//cdn.example.com/x/'
      )
      expect(normalizeAssetsBase('/cdn/')).toBe('/cdn/')
    })

    test('rejects relative values', () => {
      expect(() => normalizeAssetsBase('./cdn/')).toThrow(/assetsBase/)
      expect(() => normalizeAssetsBase('cdn/')).toThrow(/assetsBase/)
    })
  })
})
