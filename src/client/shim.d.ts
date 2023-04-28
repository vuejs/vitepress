declare const __VP_HASH_MAP__: Record<string, string>
declare const __VP_LOCAL_SEARCH__: boolean
declare const __ALGOLIA__: boolean
declare const __CARBON__: boolean
declare const __VUE_PROD_DEVTOOLS__: boolean

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent
  export default component
}

declare module '@siteData' {
  import type { SiteData } from 'vitepress'
  const data: SiteData
  export default data
}

declare module '@theme/index' {
  import type { Theme } from 'vitepress'
  const theme: Theme
  export default theme
}

declare module '@localSearchIndex' {
  const data: Record<string, () => Promise<{ default: string }>>
  export default data
}

declare module 'mark.js/src/vanilla.js' {
  import type { Mark } from 'mark.js'
  const mark: Mark
  export default mark
}
