import 'vite'

declare module 'vite' {
  interface UserConfig {
    vitepress?: import('./config').SiteConfig
  }
}
