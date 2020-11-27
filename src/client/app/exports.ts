// exports in this file are exposed to themes and md files via 'vitepress'
// so the user can do `import { useRoute, useSiteData } from 'vitepress'`

import { ComponentOptions } from 'vue'

// generic types
export type { SiteData, PageData } from '/@types/shared'

// theme types
export * from './theme'

// composables
export { useRouter, useRoute, Router, Route } from './router'
export { useSiteData } from './composables/siteData'
export { useSiteDataByRoute } from './composables/siteDataByRoute'
export { usePageData } from './composables/pageData'
export { useFrontmatter } from './composables/frontmatter'

// components
export { Content } from './components/Content'

import _Debug from './components/Debug.vue'

const Debug = _Debug as ComponentOptions

export { Debug }
