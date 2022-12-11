import { getSidebar } from 'client/theme-default/support/sidebar'

describe('client/theme-default/support/sidebar', () => {
  const root = [
    {
      text: 'A',
      collapsible: true,
      items: [
        {
          text: 'A',
          link: ''
        }
      ]
    },
    {
      text: 'B',
      items: [
        {
          text: 'B',
          link: ''
        }
      ]
    }
  ]
  const another = [
    {
      text: 'C',
      items: [
        {
          text: 'C',
          link: ''
        }
      ]
    }
  ]
  describe('normal sidebar sort', () => {
    const normalSidebar = {
      '/': root,
      '/multi-sidebar/': another
    }
    test('gets / sidebar', () => {
      expect(getSidebar(normalSidebar, '/')).toBe(root)
    })
    test('gets /multi-sidebar/ sidebar', () => {
      expect(getSidebar(normalSidebar, '/multi-sidebar/')).toBe(another)
    })
    test('gets / sidebar again', () => {
      expect(getSidebar(normalSidebar, '/some-entry.html')).toBe(root)
    })
  })
  describe('reversed sidebar sort', () => {
    const reversedSidebar = {
      '/multi-sidebar/': another,
      '/': root
    }
    test('gets / sidebar', () => {
      expect(getSidebar(reversedSidebar, '/')).toBe(root)
    })
    test('gets /multi-sidebar/ sidebar', () => {
      expect(getSidebar(reversedSidebar, '/multi-sidebar/')).toBe(another)
    })
    test('gets / sidebar again', () => {
      expect(getSidebar(reversedSidebar, '/some-entry.html')).toBe(root)
    })
  })
  describe('nested sidebar sort', () => {
    const nested = [
      {
        text: 'D',
        items: [
          {
            text: 'D',
            link: ''
          }
        ]
      }
    ]
    const nestedSidebar = {
      '/': root,
      '/multi-sidebar/': another,
      '/multi-sidebar/nested/': nested
    }
    test('gets / sidebar', () => {
      expect(getSidebar(nestedSidebar, '/')).toBe(root)
    })
    test('gets /multi-sidebar/ sidebar', () => {
      expect(getSidebar(nestedSidebar, '/multi-sidebar/')).toBe(another)
    })
    test('gets /multi-sidebar/nested/ sidebar', () => {
      expect(getSidebar(nestedSidebar, '/multi-sidebar/nested/')).toBe(nested)
    })
    test('gets / sidebar again', () => {
      expect(getSidebar(nestedSidebar, '/some-entry.html')).toBe(root)
    })
  })
})
