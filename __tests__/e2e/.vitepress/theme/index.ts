import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import CustomAppearance from './CustomAppearance.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('CustomAppearance', CustomAppearance)
  }
} satisfies Theme
