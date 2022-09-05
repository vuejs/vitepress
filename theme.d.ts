// so that users can do `import DefaultTheme from 'vitepress/theme'`
import type { ComponentOptions } from 'vue'
import { EnhanceAppContext } from './dist/client/index.js'

export const VPHomeHero: ComponentOptions
export const VPHomeFeatures: ComponentOptions
export const VPHomeSponsors: ComponentOptions
export const VPDocAsideSponsors: ComponentOptions
export const VPTeamPage: ComponentOptions
export const VPTeamPageTitle: ComponentOptions
export const VPTeamPageSection: ComponentOptions
export const VPTeamMembers: ComponentOptions

declare const theme: {
  Layout: ComponentOptions
  NotFound: ComponentOptions
  enhanceApp: EnhanceAppContext
}

export default theme
export type { DefaultTheme } from './types/default-theme.js'
