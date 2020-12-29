// exports in this file are exposed to themes and md files via 'vitepress'
// so the user can do `import { useRoute, useSiteData } from 'vitepress'`

// generic types
export type { Router, Route } from './router'

// theme types
export * from './theme'

// composables
export { useRouter, useRoute } from './router'
export { useSiteData } from './composables/siteData'
export { useSiteDataByRoute } from './composables/siteDataByRoute'
export { usePageData } from './composables/pageData'
export { useFrontmatter } from './composables/frontmatter'

// utilities
export { inBrowser, joinPath } from './utils'

// components
export { Content } from './components/Content'

import { ComponentOptions } from 'vue'
import _Debug from './components/Debug.vue'
const Debug = _Debug as ComponentOptions
export { Debug }

// default theme
export { default as DefaultTheme } from '../theme-default'
