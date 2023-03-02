<% if (!defaultTheme) { %>import Layout from './Layout.vue'
import './style.css'

export default {
  Layout,
  enhanceApp({ app, router, siteData }) {
    // TODO link to app level customizatin
  }
}
<% } else { %>import { h } from 'vue'
import Theme from 'vitepress/theme'
import './style.css'

export default {
  ...Theme,
  Layout: () => {
    return h(Theme.Layout, null, {
      // TODO link to layout slots
    })
  },
  enhanceApp({ app, router, siteData }) {
    // TODO link to app level customizatin
  }
}<% } %>
