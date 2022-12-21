import { ensureStartingSlash } from 'client/theme-default/support/utils'

describe('client/theme-default/utils', () => {
  describe('ensureStartingSlash', () => {
    test('it adds slash to the beginning of the given path', () => {
      expect(ensureStartingSlash('path')).toBe('/path')
      expect(ensureStartingSlash('path/nested')).toBe('/path/nested')
      expect(ensureStartingSlash('/path')).toBe('/path')
      expect(ensureStartingSlash('/path/nested')).toBe('/path/nested')
    })
  })
})
