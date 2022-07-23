import { defineConfig } from '../../../src/node'

export default defineConfig({
  lang: 'en-US',
  title: 'VitePress',
  description: 'Vite & Vue powered static site generator.',
  lastUpdated: true,

  themeConfig: {
    sidebar: {
      '/': [
        {
          text: 'Introduction',
          collapsible: true,
          items: [
            {
              text: 'Multiple levels outline',
              link: '/frontmatter/multiple-levels-outline'
            }
          ]
        }
      ]
    }
  }
})
