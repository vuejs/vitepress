import type { Options as VuePluginOptions } from '@vitejs/plugin-vue'
import type { UseDarkOptions } from '@vueuse/core'
import type { SitemapStreamOptions } from 'sitemap'
import type { Logger, UserConfig as ViteConfig } from 'vite'
import type { SitemapItem } from './build/generateSitemap'
import type { MarkdownOptions } from './markdown/markdown'
import type {
  Awaitable,
  HeadConfig,
  LocaleConfig,
  LocaleSpecificConfig,
  PageData,
  SSGContext,
  SiteData
} from './shared'

export type RawConfigExports<ThemeConfig = any> =
  | Awaitable<UserConfig<ThemeConfig>>
  | (() => Awaitable<UserConfig<ThemeConfig>>)

export interface TransformContext {
  page: string
  siteConfig: SiteConfig
  siteData: SiteData
  pageData: PageData
  title: string
  description: string
  head: HeadConfig[]
  content: string
  assets: string[]
}

interface UserRouteConfig {
  params: Record<string, string>
  content?: string
}

export type ResolvedRouteConfig = UserRouteConfig & {
  /**
   * the raw route (relative to src root), e.g. foo/[bar].md
   */
  route: string
  /**
   * the actual path with params resolved (relative to src root), e.g. foo/1.md
   */
  path: string
  /**
   * absolute fs path
   */
  fullPath: string
}

export interface TransformPageContext {
  siteConfig: SiteConfig
}

export interface UserConfig<ThemeConfig = any>
  extends LocaleSpecificConfig<ThemeConfig> {
  extends?: RawConfigExports<ThemeConfig>

  base?: string
  srcDir?: string
  srcExclude?: string[]
  outDir?: string
  assetsDir?: string
  cacheDir?: string

  shouldPreload?: (link: string, page: string) => boolean

  locales?: LocaleConfig<ThemeConfig>

  router?: {
    prefetchLinks?: boolean
  }

  appearance?:
    | boolean
    | 'dark'
    | 'force-dark'
    | 'force-auto'
    | (Omit<UseDarkOptions, 'initialValue'> & { initialValue?: 'dark' })
  lastUpdated?: boolean
  contentProps?: Record<string, any>

  /**
   * MarkdownIt options
   */
  markdown?: MarkdownOptions
  /**
   * Options to pass on to `@vitejs/plugin-vue`
   */
  vue?: VuePluginOptions
  /**
   * Vite config
   */
  vite?: ViteConfig & { configFile?: string | false }

  /**
   * Configure the scroll offset when the theme has a sticky header.
   * Can be a number or a selector element to get the offset from.
   * Can also be an array of selectors in case some elements will be
   * invisible due to responsive layout. VitePress will fallback to the next
   * selector if a selector fails to match, or the matched element is not
   * currently visible in viewport.
   */
  scrollOffset?:
    | number
    | string
    | string[]
    | { selector: string | string[]; padding: number }

  /**
   * Enable MPA / zero-JS mode.
   * @experimental
   */
  mpa?: boolean

  /**
   * Extracts metadata to a separate chunk.
   * @experimental
   */
  metaChunk?: boolean

  /**
   * Don't fail builds due to dead links.
   *
   * @default false
   */
  ignoreDeadLinks?:
    | boolean
    | 'localhostLinks'
    | (string | RegExp | ((link: string) => boolean))[]

  /**
   * Don't force `.html` on URLs.
   *
   * @default false
   */
  cleanUrls?: boolean

  /**
   * Use web fonts instead of emitting font files to dist.
   * The used theme should import a file named `fonts.(s)css` for this to work.
   * If you are a theme author, to support this, place your web font import
   * between `webfont-marker-begin` and `webfont-marker-end` comments.
   *
   * @default true in webcontainers, else false
   */
  useWebFonts?: boolean

  /**
   * This option allows you to configure the concurrency of the build.
   * A lower number will reduce the memory usage but will increase the build time.
   *
   * @experimental
   * @default 64
   */
  buildConcurrency?: number

  /**
   * @experimental
   *
   * source -> destination
   */
  rewrites?: Record<string, string> | ((id: string) => string)

  /**
   * @experimental
   */
  sitemap?: SitemapStreamOptions & {
    hostname: string
    transformItems?: (items: SitemapItem[]) => Awaitable<SitemapItem[]>
  }

  /**
   * Build end hook: called when SSG finish.
   * @param siteConfig The resolved configuration.
   */
  buildEnd?: (siteConfig: SiteConfig) => Awaitable<void>

  /**
   * Render end hook: called when SSR rendering is done.
   */
  postRender?: (context: SSGContext) => Awaitable<SSGContext | void>

  /**
   * Head transform hook: runs before writing HTML to dist.
   *
   * This build hook will allow you to modify the head adding new entries that cannot be statically added.
   */
  transformHead?: (context: TransformContext) => Awaitable<HeadConfig[] | void>

  /**
   * HTML transform hook: runs before writing HTML to dist.
   */
  transformHtml?: (
    code: string,
    id: string,
    ctx: TransformContext
  ) => Awaitable<string | void>

  /**
   * PageData transform hook: runs when rendering markdown to vue
   */
  transformPageData?: (
    pageData: PageData,
    ctx: TransformPageContext
  ) => Awaitable<Partial<PageData> | { [key: string]: any } | void>
}

export interface SiteConfig<ThemeConfig = any>
  extends Pick<
    UserConfig,
    | 'markdown'
    | 'vue'
    | 'vite'
    | 'shouldPreload'
    | 'router'
    | 'mpa'
    | 'metaChunk'
    | 'lastUpdated'
    | 'ignoreDeadLinks'
    | 'cleanUrls'
    | 'useWebFonts'
    | 'postRender'
    | 'buildEnd'
    | 'transformHead'
    | 'transformHtml'
    | 'transformPageData'
    | 'sitemap'
  > {
  root: string
  srcDir: string
  site: SiteData<ThemeConfig>
  configPath: string | undefined
  configDeps: string[]
  themeDir: string
  outDir: string
  assetsDir: string
  cacheDir: string
  tempDir: string
  pages: string[]
  dynamicRoutes: {
    routes: ResolvedRouteConfig[]
    fileToModulesMap: Record<string, Set<string>>
  }
  rewrites: {
    map: Record<string, string | undefined>
    inv: Record<string, string | undefined>
  }
  logger: Logger
  userConfig: UserConfig
  buildConcurrency: number
}
