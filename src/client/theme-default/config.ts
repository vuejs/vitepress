export namespace DefaultTheme {
  export interface Config {
    logo?: string
    nav?: NavItem[] | false
    sidebar?: SideBarConfig | MultiSideBarConfig
    search?: SearchConfig | false
    editLink?: EditLinkConfig | false
    lastUpdated?: string | boolean
    prevLink?: boolean
    nextLink?: boolean
  }

  // navbar --------------------------------------------------------------------

  export type NavItem = NavItemWithLink | NavItemWithChildren

  export interface NavItemWithLink extends NavItemBase {
    link: string
  }

  export interface NavItemWithChildren extends NavItemBase {
    items: NavItem[]
  }

  export interface NavItemBase {
    text: string
    target?: string
    rel?: string
    ariaLabel?: string
  }

  // sidebar -------------------------------------------------------------------

  export type SideBarConfig = SideBarItem[] | 'auto' | false

  export interface MultiSideBarConfig {
    [path: string]: SideBarConfig
  }

  export type SideBarItem = string | [string, string] | SideBarGroup

  export interface SideBarGroup {
    title: string
    path?: string
    /**
     * @default false
     */
    collapsable?: boolean
    children: SideBarItem[]
  }

  // search --------------------------------------------------------------------

  export interface SearchConfig {
    /**
     * @default 5
     */
    maxSuggestions?: number
    /**
     * @default ''
     */
    placeholder?: string
    algolia?: {
      apiKey: string
      indexName: string
    }
  }

  // edit link -----------------------------------------------------------------

  export interface EditLinkConfig {
    repo: string
    dir?: string
    branch?: string
    text?: string
  }
}
