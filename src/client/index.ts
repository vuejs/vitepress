// exports in this file are exposed to themes and md files via 'vitepress'
// so the user can do `import { useRoute, useSiteData } from 'vitepress'`

// generic types
export type { VitePressData } from './app/data.js'
export type { Route, Router } from './app/router.js'

// theme types
export type { EnhanceAppContext, Theme } from './app/theme.js'

// shared types
export type {
  HeadConfig,
  Header,
  PageData,
  SiteData
} from '../../types/shared.js'

// composables
export { useData } from './app/data.js'
export { useRoute, useRouter } from './app/router.js'

// utilities
export {
  inBrowser,
  onContentUpdated,
  defineClientComponent,
  withBase
} from './app/utils.js'

// components
export { Content } from './app/components/Content.js'
