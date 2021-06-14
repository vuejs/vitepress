// exports in this file are exposed to themes and md files via 'vitepress'
// so the user can do `import { useRoute, useSiteData } from 'vitepress'`

// generic types
export type { Router, Route } from './app/router'

// theme types
export type { Theme, EnhanceAppContext } from './app/theme'

// composables
export { useData } from './app/data'
export { useRouter, useRoute } from './app/router'

// utilities
export { inBrowser, withBase } from './app/utils'

// components
export { Content } from './app/components/Content'

import { ComponentOptions } from 'vue'
import _Debug from './app/components/Debug.vue'
const Debug = _Debug as ComponentOptions
export { Debug }
