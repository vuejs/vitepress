export namespace DefaultTheme {
  export interface Config {
    /**
     * The logo file of the site.
     *
     * @example '/logo.svg'
     */
    logo?: ThemeableImage

    /**
     * Custom site title in navbar. If the value is undefined,
     * `config.title` will be used.
     */
    siteTitle?: string | false

    /**
     * Custom header levels of outline in the aside component.
     *
     * @default 2
     */
    outline?: number | [number, number] | 'deep' | false

    /**
     * The nav items.
     */
    nav?: NavItem[]

    /**
     * The sidebar items.
     */
    sidebar?: Sidebar

    /**
     * Info for the edit link. If it's undefined, the edit link feature will
     * be disabled.
     */
    editLink?: EditLink

    /**
     * The social links to be displayed at the end of the nav bar. Perfect for
     * placing links to social services such as GitHub, Twitter, Facebook, etc.
     */
    socialLinks?: SocialLink[]

    /**
     * The footer configuration.
     */
    footer?: Footer

    /**
     * The algolia options. Leave it undefined to disable the search feature.
     */
    algolia?: AlgoliaSearchOptions

    /**
     * The carbon ads options. Leave it undefined to disable the ads feature.
     */
    carbonAds?: CarbonAdsOptions

    /**
     * Custom labels
     */
    translations?: {
      /**
       * @default 'On this page'
       */
      outlineTitle?: string

      /**
       * @default 'Last updated'
       */
      lastUpdatedText?: string

      docFooter?: {
        /**
         * @default 'Previous page'
         */
        prev?: string

        /**
         * @default 'Next page'
         */
        next?: string
      }

      /**
       * @default 'Appearance'
       */
      darkModeSwitchLabel?: string

      /**
       * @default 'Menu'
       */
      sidebarMenuLabel?: string

      /**
       * @default 'Return to top'
       */
      returnToTopLabel?: string
    }
  }

  // nav -----------------------------------------------------------------------

  export type NavItem = NavItemWithLink | NavItemWithChildren

  export type NavItemWithLink = {
    text: string
    link: string

    /**
     * `activeMatch` is expected to be a regex string. We can't use actual
     * RegExp object here because it isn't serializable
     */
    activeMatch?: string
  }

  export type NavItemChildren = {
    text?: string
    items: NavItemWithLink[]
  }

  export interface NavItemWithChildren {
    text?: string
    items: (NavItemChildren | NavItemWithLink)[]

    /**
     * `activeMatch` is expected to be a regex string. We can't use actual
     * RegExp object here because it isn't serializable
     */
    activeMatch?: string
  }

  // image -----------------------------------------------------------------------

  export type ThemeableImage = Image | { light: Image; dark: Image }
  export type Image = string | { src: string; alt?: string }

  // sidebar -------------------------------------------------------------------

  export type Sidebar = SidebarGroup[] | SidebarMulti

  export interface SidebarMulti {
    [path: string]: SidebarGroup[]
  }

  export interface SidebarGroup {
    text?: string
    items: SidebarItem[]

    /**
     * If `true`, toggle button is shown.
     *
     * @default false
     */
    collapsible?: boolean

    /**
     * If `true`, collapsible group is collapsed by default.
     *
     * @default false
     */
    collapsed?: boolean
  }

  export type SidebarItem =
    | { text: string; link: string }
    | { text: string; link?: string; items: SidebarItem[] }

  // edit link -----------------------------------------------------------------

  export interface EditLink {
    /**
     * Pattern for edit link.
     *
     * @example 'https://github.com/vuejs/vitepress/edit/main/docs/:path'
     */
    pattern: string

    /**
     * Custom text for edit link.
     *
     * @default 'Edit this page'
     */
    text?: string
  }

  // social link ---------------------------------------------------------------

  export interface SocialLink {
    icon: SocialLinkIcon
    link: string
  }

  export type SocialLinkIcon =
    | 'discord'
    | 'facebook'
    | 'github'
    | 'instagram'
    | 'linkedin'
    | 'slack'
    | 'twitter'
    | 'youtube'
    | { svg: string }

  // footer --------------------------------------------------------------------

  export interface Footer {
    message?: string
    copyright?: string
  }

  // team ----------------------------------------------------------------------

  export interface TeamMember {
    avatar: string
    name: string
    title?: string
    org?: string
    orgLink?: string
    desc?: string
    links?: SocialLink[]
    sponsor?: string
  }

  // algolia ------------------------------------------------------------------

  /**
   * The Algolia search options. Partially copied from
   * `@docsearch/react/dist/esm/DocSearch.d.ts`
   */
  export interface AlgoliaSearchOptions {
    appId: string
    apiKey: string
    indexName: string
    placeholder?: string
    searchParameters?: any
    disableUserPersonalization?: boolean
    initialQuery?: string
    buttonText?: string
  }

  // carbon ads ----------------------------------------------------------------

  export interface CarbonAdsOptions {
    code: string
    placement: string
  }
}
