<% if (useTs) { %>import { defineConfig } from 'vitepress'

// https://vitepress.vuejs.org/config/app-config
export default defineConfig(<% } else { %>/**
 * @type {import('vitepress').UserConfig}
 * https://vitepress.vuejs.org/config/app-config
 */
const config = <% } %>{
  title: <%= title %>,
  description: <%= description %><% if (defaultTheme) { %>,
  themeConfig: {
    // https://vitepress.vuejs.org/config/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/markdown-examples' }
    ],

    sidebar: [
      {
        text: 'Examples',
        items: [
          { text: 'Markdown Examples', link: '/markdown-examples' },
          { text: 'Runtime API Examples', link: '/api-examples' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }<% } %>
}<% if (useTs) { %>)<% } else { %>

export default config<% } %>
