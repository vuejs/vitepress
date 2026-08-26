import {
  computeNavFit,
  type NavFitInput
} from 'client/theme-default/composables/nav-overflow'

function fit(input: Partial<NavFitInput>) {
  return computeNavFit({
    itemWidths: [],
    translations: null,
    appearance: null,
    socialLinks: null,
    available: 0,
    extraWidth: 40,
    ...input
  })
}

describe('client/theme-default/composables/nav-overflow', () => {
  describe('computeNavFit', () => {
    test('keeps everything when it fits', () => {
      expect(
        fit({
          itemWidths: [100, 100],
          translations: 50,
          appearance: 60,
          socialLinks: 90,
          available: 400
        })
      ).toEqual({
        visibleItemCount: Infinity,
        translations: true,
        appearance: true,
        socialLinks: true
      })
    })

    test('collapses social links first', () => {
      expect(
        fit({
          itemWidths: [100, 100],
          translations: 50,
          appearance: 60,
          socialLinks: 90,
          available: 390
        })
      ).toEqual({
        visibleItemCount: Infinity,
        translations: true,
        appearance: true,
        socialLinks: false
      })
    })

    test('collapses the cluster cascade in order', () => {
      // items (200) + translations (50) fit in the 260 budget after
      // reserving the extra button, appearance (60) does not — social links
      // must follow appearance out even though they'd fit alone
      expect(
        fit({
          itemWidths: [100, 100],
          translations: 50,
          appearance: 60,
          socialLinks: 5,
          available: 300
        })
      ).toEqual({
        visibleItemCount: Infinity,
        translations: true,
        appearance: false,
        socialLinks: false
      })
    })

    test('collapses menu items right-to-left after the cluster', () => {
      expect(
        fit({
          itemWidths: [100, 100, 100],
          translations: 50,
          available: 250
        })
      ).toEqual({
        visibleItemCount: 2,
        translations: false,
        appearance: true,
        socialLinks: true
      })
    })

    test('ignores unconfigured cluster units', () => {
      expect(
        fit({
          itemWidths: [100],
          socialLinks: 90,
          available: 150
        })
      ).toEqual({
        visibleItemCount: Infinity,
        translations: true,
        appearance: true,
        socialLinks: false
      })
    })

    test('collapses everything when nothing fits', () => {
      expect(
        fit({
          itemWidths: [100, 100],
          translations: 50,
          available: 30
        })
      ).toEqual({
        visibleItemCount: 0,
        translations: false,
        // unconfigured units just stay "not collapsed"
        appearance: true,
        socialLinks: true
      })
    })

    test('a lone overwide item still collapses instead of clipping', () => {
      expect(fit({ itemWidths: [500], available: 400 }).visibleItemCount).toBe(
        0
      )
    })

    test('handles an empty nav', () => {
      expect(fit({ socialLinks: 90, appearance: 60, available: 80 })).toEqual({
        visibleItemCount: Infinity,
        translations: true,
        appearance: false,
        socialLinks: false
      })
    })
  })
})
