import { describe, test, expect } from 'vitest'
import { getSidebar } from 'client/theme-default/support/sidebar'

describe('client/theme-default/support/sidebar', () => {
  const root = [
    {
      text: 'Frontmatter',
      collapsible: true,
      items: [
        {
          text: 'Multiple levels outline',
          link: ''
        }
      ]
    },
    {
      text: 'Static Data',
      items: [
        {
          text: 'Test Page',
          link: ''
        }
      ]
    }
  ]
  const another = [
    {
      text: 'Multi Sidebar',
      items: [
        {
          text: 'Test Page',
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
    test('gets / sidebar properly', () => {
      let resolved = getSidebar(normalSidebar, '/')
      expect(resolved).toBe(root)
    })
    test('gets /multi-sidebar/ sidebar properly', () => {
      let resolved = getSidebar(normalSidebar, '/multi-sidebar/index.html')
      expect(resolved).toBe(another)
    })
    test('gets / sidebar properly again', () => {
      let resolved = getSidebar(normalSidebar, '/some-entry.html')
      expect(resolved).toBe(root)
    })
  })
  describe('reversed sidebar sort', () => {
    const reversedSidebar = {
      '/multi-sidebar/': another,
      '/': root
    }
    test('gets / sidebar properly', () => {
      let resolved = getSidebar(reversedSidebar, '/')
      expect(resolved).toBe(root)
    })
    test('gets /multi-sidebar/ sidebar properly', () => {
      let resolved = getSidebar(reversedSidebar, '/multi-sidebar/index.html')
      expect(resolved).toBe(another)
    })
    test('gets / sidebar properly again', () => {
      let resolved = getSidebar(reversedSidebar, '/some-entry.html')
      expect(resolved).toBe(root)
    })
  })
  describe('nested sidebar sort', () => {
    const nested = [
      {
        text: 'Nested Multi Sidebar',
        items: [
          {
            text: 'Test Page',
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
    test('gets / sidebar properly', () => {
      let resolved = getSidebar(nestedSidebar, '/')
      expect(resolved).toBe(root)
    })
    test('gets /multi-sidebar/ sidebar properly', () => {
      let resolved = getSidebar(nestedSidebar, '/multi-sidebar/index.html')
      expect(resolved).toBe(another)
    })
    test('gets /multi-sidebar/nested/ sidebar properly', () => {
      let resolved = getSidebar(
        nestedSidebar,
        '/multi-sidebar/nested/index.html'
      )
      expect(resolved).toBe(nested)
    })
    test('gets / sidebar properly again', () => {
      let resolved = getSidebar(nestedSidebar, '/some-entry.html')
      expect(resolved).toBe(root)
    })
  })
})
