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

export declare const VPBadge: (typeof import('./dist/client/theme-default/components/VPBadge.vue.js'))['default']
export declare const VPButton: (typeof import('./dist/client/theme-default/components/VPButton.vue.js'))['default']
export declare const VPDocAsideSponsors: (typeof import('./dist/client/theme-default/components/VPDocAsideSponsors.vue.js'))['default']
export declare const VPFeatures: (typeof import('./dist/client/theme-default/components/VPFeatures.vue.js'))['default']
export declare const VPHomeContent: (typeof import('./dist/client/theme-default/components/VPHomeContent.vue.js'))['default']
export declare const VPHomeFeatures: (typeof import('./dist/client/theme-default/components/VPHomeFeatures.vue.js'))['default']
export declare const VPHomeHero: (typeof import('./dist/client/theme-default/components/VPHomeHero.vue.js'))['default']
export declare const VPHomeSponsors: (typeof import('./dist/client/theme-default/components/VPHomeSponsors.vue.js'))['default']
export declare const VPImage: (typeof import('./dist/client/theme-default/components/VPImage.vue.js'))['default']
export declare const VPLink: (typeof import('./dist/client/theme-default/components/VPLink.vue.js'))['default']
export declare const VPNavBarSearch: (typeof import('./dist/client/theme-default/components/VPNavBarSearch.vue.js'))['default']
export declare const VPSocialLink: (typeof import('./dist/client/theme-default/components/VPSocialLink.vue.js'))['default']
export declare const VPSocialLinks: (typeof import('./dist/client/theme-default/components/VPSocialLinks.vue.js'))['default']
export declare const VPSponsors: (typeof import('./dist/client/theme-default/components/VPSponsors.vue.js'))['default']
export declare const VPTeamMembers: (typeof import('./dist/client/theme-default/components/VPTeamMembers.vue.js'))['default']
export declare const VPTeamPage: (typeof import('./dist/client/theme-default/components/VPTeamPage.vue.js'))['default']
export declare const VPTeamPageSection: (typeof import('./dist/client/theme-default/components/VPTeamPageSection.vue.js'))['default']
export declare const VPTeamPageTitle: (typeof import('./dist/client/theme-default/components/VPTeamPageTitle.vue.js'))['default']
