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

// TODO: add props for these
export declare const VPBadge: DefineComponent
export declare const VPButton: DefineComponent
export declare const VPDocAsideSponsors: DefineComponent
export declare const VPFeatures: DefineComponent
export declare const VPHomeContent: DefineComponent
export declare const VPHomeFeatures: DefineComponent
export declare const VPHomeHero: DefineComponent
export declare const VPHomeSponsors: DefineComponent
export declare const VPImage: DefineComponent
export declare const VPLink: DefineComponent
export declare const VPNavBarSearch: DefineComponent
export declare const VPSocialLink: DefineComponent
export declare const VPSocialLinks: DefineComponent
export declare const VPSponsors: DefineComponent
export declare const VPTeamMembers: DefineComponent
export declare const VPTeamPage: DefineComponent
export declare const VPTeamPageSection: DefineComponent
export declare const VPTeamPageTitle: DefineComponent
