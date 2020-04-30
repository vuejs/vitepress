// exports in this file are exposed to themes and md files via 'vitepress'
// so the user can do `import { usePageData } from 'vitepress'`
export { useSiteData } from './composables/siteData'
export { usePageData } from './composables/pageData'
export { useRouter, useRoute } from './router'

export { Content } from './components/Content'
import Debug from './components/Debug.vue'
export { Debug }
