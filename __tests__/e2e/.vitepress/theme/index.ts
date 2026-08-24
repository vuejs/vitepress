import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'

import ApiPreference from './components/ApiPreference.vue'
import CustomLayout from './components/CustomLayout.vue'
import NavVersion from './components/NavVersion.vue'

export default {
  extends: DefaultTheme,
  Layout: CustomLayout,
  enhanceApp({ app }) {
    app.component('ApiPreference', ApiPreference)
    app.component('NavVersion', NavVersion)
  }
} satisfies Theme
