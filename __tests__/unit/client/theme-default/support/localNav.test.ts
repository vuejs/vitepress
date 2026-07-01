import { shouldShowLocalNav } from 'client/theme-default/support/localNav'

describe('client/theme-default/support/localNav', () => {
  test('hides return-to-top nav at the top when nav and sidebar are disabled', () => {
    expect(shouldShowLocalNav(false, false, false, 0, 0)).toBe(false)
  })

  test('shows return-to-top nav after scrolling when nav and sidebar are disabled', () => {
    expect(shouldShowLocalNav(false, false, false, 1, 0)).toBe(true)
  })

  test('keeps local nav visible when outline or sidebar exists', () => {
    expect(shouldShowLocalNav(false, true, false, 0, 0)).toBe(true)
    expect(shouldShowLocalNav(false, false, true, 0, 0)).toBe(true)
  })

  test('hides local nav on home pages', () => {
    expect(shouldShowLocalNav(true, true, true, 100, 0)).toBe(false)
  })
})
