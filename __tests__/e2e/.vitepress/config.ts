import { defineConfig, type DefaultTheme } from 'vitepress'

const sidebar: DefaultTheme.Config['sidebar'] = {
  '/': [
    {
      text: 'Frontmatter',
      collapsed: false,
      items: [
        {
          text: 'Multiple Levels Outline',
          link: '/frontmatter/multiple-levels-outline'
        }
      ]
    },
    {
      text: '& &#60;Text Literals &> <code>code</code>',
      items: [
        {
          text: '& &#60;Test Page &> <code>code</code>',
          link: '/text-literals/'
        }
      ]
    },
    {
      text: 'Static Data',
      items: [
        {
          text: 'Test Page',
          link: '/static-data/data'
        }
      ]
    },
    {
      text: 'Multi Sidebar Test',
      items: [
        {
          text: 'Test Page',
          link: '/multi-sidebar/'
        }
      ]
    }
  ],
  '/multi-sidebar/': [
    {
      text: 'Multi Sidebar',
      items: [
        {
          text: 'Test Page',
          link: '/multi-sidebar/'
        },
        {
          text: 'Back',
          link: '/'
        }
      ]
    }
  ]
}

export default defineConfig({
  title: 'Example',
  description: 'An example app using VitePress.',
  themeConfig: {
    sidebar
  }
})
