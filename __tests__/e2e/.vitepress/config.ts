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
      text: 'Data Loading',
      items: [
        {
          text: 'Test Page',
          link: '/data-loading/data'
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
    },
    {
      text: 'Dynamic Routes',
      items: [
        {
          text: 'Foo',
          link: '/dynamic-routes/foo'
        },
        {
          text: 'Bar',
          link: '/dynamic-routes/bar'
        }
      ]
    },
    {
      text: 'Markdown Extensions',
      items: [
        {
          text: 'Test Page',
          link: '/markdown-extensions/'
        },
        {
          text: 'Foo',
          link: '/markdown-extensions/foo'
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
