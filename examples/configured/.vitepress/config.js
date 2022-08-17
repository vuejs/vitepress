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
          text: 'Static Data',
          items: [
            {
              text: 'Test Page',
              link: '/static-data/data'
            }
          ]
        }
      ]
    }
  }
})
