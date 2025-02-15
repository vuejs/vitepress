import { defineConfig, type DefaultTheme } from 'vitepress'

const nav: DefaultTheme.Config['nav'] = [
  {
    text: 'Home',
    link: '/'
  },
  {
    text: 'API Reference',
    items: [
      {
        text: 'Example',
        link: '/home.html'
      },
      {
        component: 'ApiPreference',
        props: {
          options: ['JavaScript', 'TypeScript', 'Flow'],
          defaultOption: 'TypeScript'
        }
      },
      {
        component: 'ApiPreference',
        props: {
          options: ['Options', 'Composition'],
          defaultOption: 'Composition'
        }
      }
    ]
  },
  {
    component: 'NavVersion',
    props: {
      versions: [
        {
          text: 'v1.x',
          link: '/'
        },
        {
          text: 'v0.x',
          link: '/v0.x/'
        }
      ]
    }
  },
  {
    text: 'Nested',
    items: [
      {
        text: 'Level 1 - 1',
        items: [
          {
            text: 'Level 2 - 1',
            link: '/nested/level1-1/level2-1'
          }
        ]
      },
      {
        text: 'Level 1 - 2',
        items: [
          {
            text: 'Level 2 - 2',
            link: '/nested/level1-2/level2-2'
          }
        ]
      }
    ]
  }
]

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
  markdown: {
    image: {
      lazyLoading: true
    }
  },
  themeConfig: {
    nav,
    sidebar,
    search: {
      provider: 'local',
      options: {
        async _render(src, env, md) {
          const html = await md.renderAsync(src, env)
          if (env.frontmatter?.search === false) return ''
          if (env.relativePath.startsWith('local-search/excluded')) return ''
          return html
        }
      }
    }
  },
  vite: {
    server: {
      watch: {
        usePolling: true,
        interval: 100
      }
    }
  }
})
