// exports in this file are exposed to themes and md files via 'vitepress'
// so the user can do `import { useRoute, useData } from 'vitepress'`

// generic types
export type { VitePressData } from './app/data'
export type { Route, Router } from './app/router'

// theme types
export type { EnhanceAppContext, Theme } from './app/theme'

// shared types
export type { HeadConfig, Header, PageData, SiteData } from '../../types/shared'

// composables
export { dataSymbol, useData } from './app/data'
export { useRoute, useRouter } from './app/router'

// utilities
export {
  _escapeHtml,
  defineClientComponent,
  getScrollOffset,
  inBrowser,
  onContentUpdated,
  withBase
} from './app/utils'

// components
export { Content } from './app/components/Content'
