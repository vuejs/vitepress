import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Configured Example',
  description: 'Example of configured options of VitePress',
  themeConfig: {
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
  }
})
