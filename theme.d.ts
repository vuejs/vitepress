// so that users can do `import DefaultTheme from 'vitepress/theme'`

import type { DefineComponent } from 'vue'
import type { EnhanceAppContext } from './dist/client/index.js'
import type { DefaultTheme } from './types/default-theme.js'

export type { DefaultTheme } from './types/default-theme.js'

declare const theme: {
  Layout: DefineComponent
  enhanceApp: (ctx: EnhanceAppContext) => void
}

export default theme
export declare const useSidebar: () => DefaultTheme.DocSidebar

// TODO: add props for these
export declare const VPButton: DefineComponent
export declare const VPDocAsideSponsors: DefineComponent
export declare const VPHomeFeatures: DefineComponent
export declare const VPHomeHero: DefineComponent
export declare const VPHomeSponsors: DefineComponent
export declare const VPImage: DefineComponent
export declare const VPSponsors: DefineComponent
export declare const VPTeamMembers: DefineComponent
export declare const VPTeamPage: DefineComponent
export declare const VPTeamPageSection: DefineComponent
export declare const VPTeamPageTitle: DefineComponent
