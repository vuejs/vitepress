import type { Theme } from 'vitepress'

export default {
  enhanceApp({ app }) {
    console.log('enhanceApp from my-additional-theme-file.ts')
  }
} satisfies Theme
