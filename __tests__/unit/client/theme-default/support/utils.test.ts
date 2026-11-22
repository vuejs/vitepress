import {
  ensureStartingSlash,
  isLinkExternal,
  normalizeLink
} from 'client/theme-default/support/utils'

const site = { base: '/', cleanUrls: false }

vi.mock('vitepress', () => ({
  useData: () => ({ site: { value: site } }),
  withBase: (path: string) => path
}))

describe('client/theme-default/utils', () => {
  describe('ensureStartingSlash', () => {
    test('it adds slash to the beginning of the given path', () => {
      expect(ensureStartingSlash('path')).toBe('/path')
      expect(ensureStartingSlash('path/nested')).toBe('/path/nested')
      expect(ensureStartingSlash('/path')).toBe('/path')
      expect(ensureStartingSlash('/path/nested')).toBe('/path/nested')
    })
  })

  describe('isLinkExternal', () => {
    test('it detects external links by default', () => {
      expect(isLinkExternal('https://vite.dev')).toBe(true)
      expect(isLinkExternal('/guide/')).toBe(false)
    })

    test('it treats _blank targets as external by default', () => {
      expect(isLinkExternal('/guide/', '_blank')).toBe(true)
    })

    test('it allows callers to override external detection', () => {
      expect(isLinkExternal('https://cn.vite.dev', undefined, false)).toBe(
        false
      )
      expect(isLinkExternal('/guide/', undefined, true)).toBe(true)
    })
  })

  describe('normalizeLink', () => {
    test('it keeps every leading parent segment of relative links', () => {
      expect(normalizeLink('./foo')).toBe('./foo.html')
      expect(normalizeLink('../foo')).toBe('../foo.html')
      expect(normalizeLink('../../foo.md')).toBe('../../foo.html')
      expect(normalizeLink('../../../foo/bar?a=1#baz')).toBe(
        '../../../foo/bar.html?a=1#baz'
      )
    })
  })
})
