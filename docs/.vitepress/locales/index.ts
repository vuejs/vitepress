import { defineConfig } from 'vitepress'
import en from './en'
import zh from './zh'

export default defineConfig({
  locales: {
    root: {
      label: 'English',
      lang: en.lang,
      themeConfig: en.themeConfig,
      description: en.description
    },
    zh: {
      label: '简体中文',
      lang: zh.lang,
      themeConfig: zh.themeConfig,
      description: zh.description
    }
  }
})
