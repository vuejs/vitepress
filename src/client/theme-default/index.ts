import './styles/vars.css'
import './styles/layout.css'
import './styles/code.css'
import './styles/custom-blocks.css'

import Layout from './Layout.vue'
import NotFound from './NotFound.vue'
import { Theme } from '../app/theme'
import { installGoogleAnalytics } from './ga'

const theme: Theme = {
  Layout,
  NotFound,
  enhanceApp({ router, siteData }) {
    const { googleAnalytics: GA_ID } = siteData.value.themeConfig
    if (
      GA_ID &&
      process.env.NODE_ENV === 'production' &&
      typeof window !== 'undefined'
    ) {
      installGoogleAnalytics(GA_ID, router)
    }
  }
}

export default theme
