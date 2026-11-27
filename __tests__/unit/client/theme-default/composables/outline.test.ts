import {
  findActiveLink,
  resolveHeaders
} from 'client/theme-default/composables/outline'

const element = {
  classList: {
    contains: () => false
  }
} as unknown as HTMLHeadElement

describe('client/theme-default/composables/outline', () => {
  describe('resolveHeader', () => {
    test('levels range', () => {
      expect(
        resolveHeaders(
          [
            {
              level: 2,
              title: 'h2 - 1',
              link: '#h2-1',
              element
            },
            {
              level: 3,
              title: 'h3 - 1',
              link: '#h3-1',
              element
            }
          ],
          [2, 3]
        )
      ).toEqual([
        {
          level: 2,
          title: 'h2 - 1',
          link: '#h2-1',
          children: [
            {
              level: 3,
              title: 'h3 - 1',
              link: '#h3-1',
              children: [],
              element
            }
          ],
          element
        }
      ])
    })

    test('specific level', () => {
      expect(
        resolveHeaders(
          [
            {
              level: 2,
              title: 'h2 - 1',
              link: '#h2-1',
              element
            },
            {
              level: 3,
              title: 'h3 - 1',
              link: '#h3-1',
              element
            }
          ],
          2
        )
      ).toEqual([
        {
          level: 2,
          title: 'h2 - 1',
          link: '#h2-1',
          children: [],
          element
        }
      ])
    })

    test('complex deep', () => {
      expect(
        resolveHeaders(
          [
            {
              level: 2,
              title: 'h2 - 1',
              link: '#h2-1',
              element
            },
            {
              level: 3,
              title: 'h3 - 1',
              link: '#h3-1',
              element
            },
            {
              level: 4,
              title: 'h4 - 1',
              link: '#h4-1',
              element
            },
            {
              level: 3,
              title: 'h3 - 2',
              link: '#h3-2',
              element
            },
            {
              level: 4,
              title: 'h4 - 2',
              link: '#h4-2',
              element
            },
            {
              level: 2,
              title: 'h2 - 2',
              link: '#h2-2',
              element
            },
            {
              level: 3,
              title: 'h3 - 3',
              link: '#h3-3',
              element
            },
            {
              level: 4,
              title: 'h4 - 3',
              link: '#h4-3',
              element
            }
          ],
          'deep'
        )
      ).toEqual([
        {
          level: 2,
          title: 'h2 - 1',
          link: '#h2-1',
          children: [
            {
              level: 3,
              title: 'h3 - 1',
              link: '#h3-1',
              children: [
                {
                  level: 4,
                  title: 'h4 - 1',
                  link: '#h4-1',
                  children: [],
                  element
                }
              ],
              element
            },
            {
              level: 3,
              title: 'h3 - 2',
              link: '#h3-2',
              children: [
                {
                  level: 4,
                  title: 'h4 - 2',
                  link: '#h4-2',
                  children: [],
                  element
                }
              ],
              element
            }
          ],
          element
        },
        {
          level: 2,
          title: 'h2 - 2',
          link: '#h2-2',
          children: [
            {
              level: 3,
              title: 'h3 - 3',
              link: '#h3-3',
              children: [
                {
                  level: 4,
                  title: 'h4 - 3',
                  link: '#h4-3',
                  children: [],
                  element
                }
              ],
              element
            }
          ],
          element
        }
      ])
    })
  })

  describe('findActiveLink', () => {
    const defaultHeaders = [
      { link: '#sec1', top: 200, scrollMarginTop: 26 },
      { link: '#sec2', top: 600, scrollMarginTop: 26 },
      { link: '#sec3', top: 1000, scrollMarginTop: 26 },
      { link: '#sec4', top: 1400, scrollMarginTop: 26 },
      { link: '#sec5', top: 1800, scrollMarginTop: 26 },
      { link: '#sec6', top: 2100, scrollMarginTop: 26 },
      { link: '#sec7', top: 2350, scrollMarginTop: 26 },
      { link: '#sec8', top: 2550, scrollMarginTop: 26 },
      { link: '#sec9', top: 2700, scrollMarginTop: 26 },
      { link: '#sec10', top: 2850, scrollMarginTop: 26 }
    ]

    test('returns null when no headers or at page top', () => {
      expect(findActiveLink([], 100, 800, 3000)).toBeNull()
      expect(findActiveLink(defaultHeaders, 0, 800, 3000)).toBeNull()
      expect(findActiveLink(defaultHeaders, 0.5, 800, 3000)).toBeNull()
    })

    test('sequentially activates items without skipping short sections near bottom (#5473)', () => {
      const innerHeight = 800
      const scrollHeight = 3000
      const maxScroll = scrollHeight - innerHeight

      const activeOrder: (string | null)[] = []
      for (let y = 0; y <= maxScroll; y += 5) {
        const active = findActiveLink(
          defaultHeaders,
          y,
          innerHeight,
          scrollHeight
        )
        if (
          !activeOrder.length ||
          activeOrder[activeOrder.length - 1] !== active
        ) {
          activeOrder.push(active)
        }
      }

      expect(activeOrder).toEqual([
        null,
        '#sec1',
        '#sec2',
        '#sec3',
        '#sec4',
        '#sec5',
        '#sec6',
        '#sec7',
        '#sec8',
        '#sec9',
        '#sec10'
      ])
    })

    test('sequentially activates items in reverse order when scrolling back up (#5473)', () => {
      const innerHeight = 800
      const scrollHeight = 3000
      const maxScroll = scrollHeight - innerHeight

      const reverseOrder: (string | null)[] = []
      for (let y = maxScroll; y >= 0; y -= 5) {
        const active = findActiveLink(
          defaultHeaders,
          y,
          innerHeight,
          scrollHeight
        )
        if (
          !reverseOrder.length ||
          reverseOrder[reverseOrder.length - 1] !== active
        ) {
          reverseOrder.push(active)
        }
      }

      expect(reverseOrder).toEqual([
        '#sec10',
        '#sec9',
        '#sec8',
        '#sec7',
        '#sec6',
        '#sec5',
        '#sec4',
        '#sec3',
        '#sec2',
        '#sec1',
        null
      ])
    })

    test('works on short pages without prematurely skipping top sections', () => {
      const innerHeight = 1000
      const scrollHeight = 1200
      const maxScroll = scrollHeight - innerHeight
      const shortPageHeaders = [
        { link: '#intro', top: 200, scrollMarginTop: 26 },
        { link: '#step1', top: 500, scrollMarginTop: 26 },
        { link: '#step2', top: 800, scrollMarginTop: 26 },
        { link: '#summary', top: 1100, scrollMarginTop: 26 }
      ]

      // At 1px scroll, top header should NOT be skipped
      expect(
        findActiveLink(shortPageHeaders, 1, innerHeight, scrollHeight)
      ).toBeNull()
      // Once scrolled enough, #intro becomes active
      expect(
        findActiveLink(shortPageHeaders, 50, innerHeight, scrollHeight)
      ).toBe('#intro')

      const activeOrder: (string | null)[] = []
      for (let y = 0; y <= maxScroll; y += 5) {
        const active = findActiveLink(
          shortPageHeaders,
          y,
          innerHeight,
          scrollHeight
        )
        if (
          !activeOrder.length ||
          activeOrder[activeOrder.length - 1] !== active
        ) {
          activeOrder.push(active)
        }
      }

      expect(activeOrder).toEqual([
        null,
        '#intro',
        '#step1',
        '#step2',
        '#summary'
      ])
    })

    test('activates the final item when at page bottom', () => {
      const innerHeight = 800
      const scrollHeight = 3000
      const maxScroll = scrollHeight - innerHeight

      expect(
        findActiveLink(defaultHeaders, maxScroll, innerHeight, scrollHeight)
      ).toBe('#sec10')
      expect(
        findActiveLink(defaultHeaders, maxScroll - 1, innerHeight, scrollHeight)
      ).toBe('#sec10')
    })
  })
})
