// exports in this file are exposed to themes and md files via 'vitepress'
// so the user can do `import { useRoute, useSiteData } from 'vitepress'`

// generic types
export type { Router, Route } from './app/router.js'
export type { VitePressData } from './app/data.js'
// theme types
export type { Theme, EnhanceAppContext } from './app/theme.js'
// shared types
export type {
  PageData,
  SiteData,
  HeadConfig,
  Header,
  LocaleConfig
} from '../../types/shared.js'

// composables
export { useData } from './app/data.js'
export { useRouter, useRoute } from './app/router.js'

// utilities
export { inBrowser, withBase } from './app/utils.js'

// components
export { Content } from './app/components/Content.js'
