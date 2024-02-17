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
export declare const useLocalNav: () => DefaultTheme.DocLocalNav

export declare const VPBadge: typeof import('./dist/client/theme-default/components/VPBadge.vue').default
export declare const VPButton: typeof import('./dist/client/theme-default/components/VPButton.vue').default
export declare const VPDocAsideSponsors: typeof import('./dist/client/theme-default/components/VPDocAsideSponsors.vue').default
export declare const VPHomeFeatures: typeof import('./dist/client/theme-default/components/VPHomeFeatures.vue').default
export declare const VPHomeHero: typeof import('./dist/client/theme-default/components/VPHomeHero.vue').default
export declare const VPHomeSponsors: typeof import('./dist/client/theme-default/components/VPHomeSponsors.vue').default
export declare const VPImage: typeof import('./dist/client/theme-default/components/VPImage.vue').default
export declare const VPSponsors: typeof import('./dist/client/theme-default/components/VPSponsors.vue').default
export declare const VPTeamMembers: typeof import('./dist/client/theme-default/components/VPTeamMembers.vue').default
export declare const VPTeamPage: typeof import('./dist/client/theme-default/components/VPTeamPage.vue').default
export declare const VPTeamPageSection: typeof import('./dist/client/theme-default/components/VPTeamPageSection.vue').default
export declare const VPTeamPageTitle: typeof import('./dist/client/theme-default/components/VPTeamPageTitle.vue').default
