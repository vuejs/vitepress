declare const __VP_HASH_MAP__: Record<string, string>
declare const __ALGOLIA__: boolean
declare const __CARBON__: boolean
declare const __MERMAID__: boolean
declare const __VUE_PROD_DEVTOOLS__: boolean

declare module '*.vue' {
  import { ComponentOptions } from 'vue'
  const comp: ComponentOptions
  export default comp
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

declare module 'mermaid' {
  import mermaidAPI from 'mermaid/mermaidAPI.js'
  const mermaid: {
    initialize(config: mermaidAPI.default.Config): void
    render(
      id: string,
      txt: string,
      cb?: (svgCode: string, bindFunctions: (element: Element) => void) => void,
      container?: Element
    ): string
  }
  export default mermaid
}
