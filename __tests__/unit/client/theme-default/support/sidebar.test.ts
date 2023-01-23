import { getSidebar, hasActiveLink } from 'client/theme-default/support/sidebar'

describe('client/theme-default/support/sidebar', () => {
  describe('getSidebar', () => {
    const root = [
      {
        text: 'A',
        collapsible: true,
        items: [{ text: 'A', link: '' }]
      },
      {
        text: 'B',
        items: [{ text: 'B', link: '' }]
      }
    ]

    const another = [
      {
        text: 'C',
        items: [{ text: 'C', link: '' }]
      }
    ]

    describe('normal sidebar sort', () => {
      const normalSidebar = {
        '/': root,
        '/multi-sidebar/': another
      }

      test('gets `/` sidebar', () => {
        expect(getSidebar(normalSidebar, '/')).toBe(root)
      })

      test('gets `/multi-sidebar/` sidebar', () => {
        expect(getSidebar(normalSidebar, '/multi-sidebar/')).toBe(another)
      })

      test('gets `/` sidebar again', () => {
        expect(getSidebar(normalSidebar, '/some-entry.html')).toBe(root)
      })
    })

    describe('reversed sidebar sort', () => {
      const reversedSidebar = {
        '/multi-sidebar/': another,
        '/': root
      }

      test('gets `/` sidebar', () => {
        expect(getSidebar(reversedSidebar, '/')).toBe(root)
      })

      test('gets `/multi-sidebar/` sidebar', () => {
        expect(getSidebar(reversedSidebar, '/multi-sidebar/')).toBe(another)
      })

      test('gets `/` sidebar again', () => {
        expect(getSidebar(reversedSidebar, '/some-entry.html')).toBe(root)
      })
    })

    describe('nested sidebar sort', () => {
      const nested = [
        {
          text: 'D',
          items: [{ text: 'D', link: '' }]
        }
      ]

      const nestedSidebar = {
        '/': root,
        '/multi-sidebar/': another,
        '/multi-sidebar/nested/': nested
      }

      test('gets `/` sidebar', () => {
        expect(getSidebar(nestedSidebar, '/')).toBe(root)
      })

      test('gets `/multi-sidebar/` sidebar', () => {
        expect(getSidebar(nestedSidebar, '/multi-sidebar/')).toBe(another)
      })

      test('gets `/multi-sidebar/nested/` sidebar', () => {
        expect(getSidebar(nestedSidebar, '/multi-sidebar/nested/')).toBe(nested)
      })

      test('gets `/` sidebar again', () => {
        expect(getSidebar(nestedSidebar, '/some-entry.html')).toBe(root)
      })
    })
  })

  describe('hasActiveLink', () => {
    test('checks `SidebarItem`', () => {
      const item = {
        text: 'Item 001',
        items: [
          { text: 'Item 001', link: '/active-1' },
          { text: 'Item 002', link: '/active-2' }
        ]
      }

      expect(hasActiveLink('active-1', item)).toBe(true)
      expect(hasActiveLink('inactive', item)).toBe(false)
    })

    test('checks `SidebarItem[]`', () => {
      const item = [
        {
          text: 'Item 001',
          items: [
            { text: 'Item 001', link: '/active-1' },
            { text: 'Item 002', link: '/active-2' }
          ]
        },
        {
          text: 'Item 002',
          items: [
            { text: 'Item 003', link: '/active-3' },
            { text: 'Item 004', link: '/active-4' }
          ]
        }
      ]

      expect(hasActiveLink('active-1', item)).toBe(true)
      expect(hasActiveLink('active-3', item)).toBe(true)
      expect(hasActiveLink('inactive', item)).toBe(false)
    })
  })
})
