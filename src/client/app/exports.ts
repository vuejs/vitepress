// exports in this file are exposed to themes and md files via 'vitepress'
// so the user can do `import { usePageData } from 'vitepress'`

// theme types
export * from './theme'

// composables
export { useSiteData } from './composables/siteData'
export { usePageData } from './composables/pageData'
export { useSiteDataByRoute } from './composables/siteDataByRoute'
export { useRouter, useRoute, Router, Route } from './router'

// components
export { Content } from './components/Content'

import _Debug from './components/Debug.vue'
import { ComponentOptions } from 'vue'
const Debug = _Debug as ComponentOptions
export { Debug }
