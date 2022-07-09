import { describe, test, expect } from 'vitest'
import * as Utils from 'client/theme-default/support/utils'

describe('client/theme-default/utils', () => {
  describe('ensureStartingSlash', () => {
    test('it adds slash to the beginning of the given path', () => {
      expect(Utils.ensureStartingSlash('path')).toBe('/path')
      expect(Utils.ensureStartingSlash('path/nested')).toBe('/path/nested')
      expect(Utils.ensureStartingSlash('/path')).toBe('/path')
      expect(Utils.ensureStartingSlash('/path/nested')).toBe('/path/nested')
    })
  })
})
