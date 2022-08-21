import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Configured Example',
  description: 'Example of configured options of VitePress',
  themeConfig: {
    nav: [
      {
        text: 'TOC',
        activeMatch: `^/toc/`,
        link: '/toc/'
      },
      {
        text: 'TOC2',
        activeMatch: `^/toc2/`,
        link: '/toc2/'
      }
    ],
    sidebar: {
      '/': [
        {
          text: 'Frontmatter',
          collapsible: true,
          items: [
            {
              text: 'Multiple levels outline',
              link: '/frontmatter/multiple-levels-outline'
            }
          ]
        },
        {
          text: 'TOC',
          toc: '/toc/',
          items: [
            {
              text: 'Multiple levels outline',
              link: '/frontmatter/multiple-levels-outline'
            },
            {
              text: 'Test Nested TOC',
              items: [
                {
                  text: 'Hello1',
                  link: '/toc/hello'
                }
              ]
            },
            {
              text: 'Hello2',
              link: '/toc/hello2'
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
          text: 'TOC2',
          toc: '/toc2/',
          items: [
            {
              text: 'Multiple levels outline - 2',
              link: '/frontmatter/multiple-levels-outline'
            },
            {
              text: 'Test Nested TOC - 2',
              items: [
                {
                  text: 'Hello1 - 2',
                  link: '/toc2/hello'
                }
              ]
            },
            {
              text: 'Hello2 - 2',
              link: '/toc2/hello2'
            }
          ]
        }
      ]
    }
  }
})
