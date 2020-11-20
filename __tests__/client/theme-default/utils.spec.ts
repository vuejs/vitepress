import * as Utils from 'client/theme-default/utils'

describe('client/theme-default/utils', () => {
  describe('ensureStartingSlash', () => {
    it('should add slash to the beginning of the given path', () => {
      expect(Utils.ensureStartingSlash('path')).toBe('/path')
      expect(Utils.ensureStartingSlash('path/nested')).toBe('/path/nested')
      expect(Utils.ensureStartingSlash('/path')).toBe('/path')
      expect(Utils.ensureStartingSlash('/path/nested')).toBe('/path/nested')
    })
  })

  describe('ensureEndingSlash', () => {
    it('should add slash to the end of the given path', () => {
      expect(Utils.ensureEndingSlash('path')).toBe('path/')
      expect(Utils.ensureEndingSlash('path/nested')).toBe('path/nested/')
      expect(Utils.ensureEndingSlash('path/')).toBe('path/')
      expect(Utils.ensureEndingSlash('path/nested/')).toBe('path/nested/')
      expect(Utils.ensureEndingSlash('path/page.html')).toBe('path/page.html')
    })
  })
})
