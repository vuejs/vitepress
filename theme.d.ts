// so that users can do `import DefaultTheme from 'vitepress/theme'`
import type { DefineComponent } from 'vue'
import { EnhanceAppContext } from './dist/client/index.js'

// TODO: add props for these
export const VPHomeHero: DefineComponent
export const VPHomeFeatures: DefineComponent
export const VPHomeSponsors: DefineComponent
export const VPDocAsideSponsors: DefineComponent
export const VPTeamPage: DefineComponent
export const VPTeamPageTitle: DefineComponent
export const VPTeamPageSection: DefineComponent
export const VPTeamMembers: DefineComponent

declare const theme: {
  Layout: DefineComponent
  enhanceApp: (ctx: EnhanceAppContext) => void
}

export default theme
export type { DefaultTheme } from './types/default-theme.js'

export const useSidebar: () => DefaultTheme.SideBar
