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
    },
    {
      text: 'Multi Sidebar Test',
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
        },
        {
          text: 'Back',
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
})
