import { getAriaCurrent } from 'client/theme-default/support/aria'

describe('client/theme-default/support/aria', () => {
  test('marks active page links as current', () => {
    expect(getAriaCurrent(true)).toBe('page')
  })

  test('omits aria-current for inactive links', () => {
    expect(getAriaCurrent(false)).toBeUndefined()
  })
})
