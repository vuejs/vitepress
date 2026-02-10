// so that users can do `import DefaultTheme from 'vitepress/theme'`

import type { ComputedRef, DefineComponent, ShallowRef } from 'vue'
import type { EnhanceAppContext } from './dist/client/index.js'
import type { DefaultTheme } from './types/default-theme.js'

export type { DefaultTheme } from './types/default-theme.js'

declare const theme: {
  Layout: DefineComponent
  enhanceApp: (ctx: EnhanceAppContext) => void
}

export default theme

export declare const useLayout: () => {
  isHome: ComputedRef<boolean>

  sidebar: Readonly<ShallowRef<DefaultTheme.SidebarItem[]>>
  sidebarGroups: ComputedRef<DefaultTheme.SidebarItem[]>
  hasSidebar: ComputedRef<boolean>
  isSidebarEnabled: ComputedRef<boolean>

  hasAside: ComputedRef<boolean>
  leftAside: ComputedRef<boolean>

  /**
   * The outline headers of the current page.
   */
  headers: Readonly<ShallowRef<DefaultTheme.OutlineItem[]>>
  /**
   * Whether the current page has a local nav. Local nav is shown when the
   * "outline" is present in the page. However, note that the actual
   * local nav visibility depends on the screen width as well.
   */
  hasLocalNav: ComputedRef<boolean>
}

export declare const VPBadge: typeof import('./dist/client/theme-default/components/VPBadge.vue').default
export declare const VPButton: typeof import('./dist/client/theme-default/components/VPButton.vue').default
export declare const VPDocAsideSponsors: typeof import('./dist/client/theme-default/components/VPDocAsideSponsors.vue').default
export declare const VPFeatures: typeof import('./dist/client/theme-default/components/VPFeatures.vue').default
export declare const VPHomeContent: typeof import('./dist/client/theme-default/components/VPHomeContent.vue').default
export declare const VPHomeFeatures: typeof import('./dist/client/theme-default/components/VPHomeFeatures.vue').default
export declare const VPHomeHero: typeof import('./dist/client/theme-default/components/VPHomeHero.vue').default
export declare const VPHomeSponsors: typeof import('./dist/client/theme-default/components/VPHomeSponsors.vue').default
export declare const VPImage: typeof import('./dist/client/theme-default/components/VPImage.vue').default
export declare const VPLink: typeof import('./dist/client/theme-default/components/VPLink.vue').default
export declare const VPNavBarSearch: typeof import('./dist/client/theme-default/components/VPNavBarSearch.vue').default
export declare const VPSocialLink: typeof import('./dist/client/theme-default/components/VPSocialLink.vue').default
export declare const VPSocialLinks: typeof import('./dist/client/theme-default/components/VPSocialLinks.vue').default
export declare const VPSponsors: typeof import('./dist/client/theme-default/components/VPSponsors.vue').default
export declare const VPTeamMembers: typeof import('./dist/client/theme-default/components/VPTeamMembers.vue').default
export declare const VPTeamPage: typeof import('./dist/client/theme-default/components/VPTeamPage.vue').default
export declare const VPTeamPageSection: typeof import('./dist/client/theme-default/components/VPTeamPageSection.vue').default
export declare const VPTeamPageTitle: typeof import('./dist/client/theme-default/components/VPTeamPageTitle.vue').default
