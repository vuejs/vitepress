// exports in this file are exposed to themes and md files via 'vitepress'
// so the user can do `import { useRoute, useData } from 'vitepress'`

// generic types
export type { VitePressData } from './app/data'
export type { Route, Router } from './app/router'

// theme types
export type { EnhanceAppContext, Theme } from './app/theme'

// shared types
export type { HeadConfig, Header, PageData, SiteData } from '../../types/shared'

// components
import { ClientOnly } from './app/components/ClientOnly'
import { Content } from './app/components/Content'

// composables
export { dataSymbol, useData } from './app/data'
export { useRoute, useRouter } from './app/router'

// utilities
export {
  _escapeHtml,
  defineClientComponent,
  inBrowser,
  onContentUpdated,
  withBase
} from './app/utils'

// components
export { ClientOnly, Content }

declare module 'vue' {
  interface GlobalComponents {
    ClientOnly: typeof ClientOnly
    Content: typeof Content
  }
}
