import {
  ensureStartingSlash,
  isLinkExternal
} from 'client/theme-default/support/utils'

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
})
