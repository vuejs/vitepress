import {
  ensureStartingSlash,
  clearUrlHash
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

  describe('clearUrlHash', () => {
    test('function will return when http://localhost:5173/guide/getting-started when url is http://localhost:5173/guide/getting-started#step-2-install-vitepress', () => {
      expect(
        clearUrlHash(
          'http://localhost:5173/guide/getting-started#step-2-install-vitepress'
        )
      ).toBe('http://localhost:5173/guide/getting-started')
    })

    test('function will return when http://localhost:5173/guide/getting-started when url is http://localhost:5173/guide/getting-started', () => {
      expect(clearUrlHash('http://localhost:5173/guide/getting-started')).toBe(
        'http://localhost:5173/guide/getting-started'
      )
    })
  })
})
