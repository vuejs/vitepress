import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import NavVersion from './components/NavVersion.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('NavVersion', NavVersion)
  }
} satisfies Theme
