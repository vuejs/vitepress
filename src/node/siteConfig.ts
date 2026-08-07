import type { Options as VuePluginOptions } from '@vitejs/plugin-vue'
import type { UseDarkOptions } from '@vueuse/core'
import type { SitemapStreamOptions } from 'sitemap'
import type { Logger, UserConfig as ViteConfig } from 'vite'
import type {
  AdditionalConfigDict,
  AdditionalConfigLoader
} from '../../types/shared'
import type { SitemapItem } from './build/generateSitemap'
import type { MarkdownOptions } from './markdown/markdown'
import type { ResolvedRouteConfig } from './plugins/dynamicRoutesPlugin'
import type {
  Awaitable,
  HeadConfig,
  LocaleConfig,
  LocaleSpecificConfig,
  PageData,
  SSGContext,
  SiteData
} from './shared'

/**
 * A config object, or a function returning one. Both can be async.
 */
export type RawConfigExports<ThemeConfig = any> =
  | Awaitable<UserConfig<ThemeConfig>>
  | (() => Awaitable<UserConfig<ThemeConfig>>)

/**
 * Context passed to the `transformHead` and `transformHtml` build hooks.
 */
export interface TransformContext<ThemeConfig = any> {
  /**
   * Name of the output HTML file, relative to the output directory.
   */
  page: string
  /**
   * The resolved site config.
   */
  siteConfig: SiteConfig<ThemeConfig>
  /**
   * The resolved site data.
   */
  siteData: SiteData
  /**
   * Data of the page being rendered.
   */
  pageData: PageData
  /**
   * Full title of the page, including the site title suffix.
   */
  title: string
  /**
   * Description of the page.
   */
  description: string
  /**
   * Head entries that are going to be written to the page.
   */
  head: HeadConfig[]
  /**
   * Rendered HTML of the page content.
   */
  content: string
  /**
   * Assets referenced by the page.
   */
  assets: string[]
}

/**
 * Context passed to the `transformPageData` hook.
 */
export interface TransformPageContext<ThemeConfig = any> {
  /**
   * The resolved site config.
   */
  siteConfig: SiteConfig<ThemeConfig>
}

/**
 * VitePress config, usually defined in `.vitepress/config.[ext]`.
 */
export interface UserConfig<
  ThemeConfig = any
> extends LocaleSpecificConfig<ThemeConfig> {
  /**
   * Config to inherit from. Its values are recursively merged with (and
   * overridden by) this config. Commonly used to extend a base config
   * shared by a theme.
   */
  extends?: RawConfigExports<ThemeConfig>
  /**
   * The base URL the site is deployed at. Must start and end with a slash.
   * @default '/'
   */
  base?: string
  /**
   * Directory containing the markdown source files, relative to the
   * project root.
   * @default '.'
   */
  srcDir?: string
  /**
   * Glob patterns for source files to exclude from the site.
   * @example ['**\/README.md', '**\/TODO.md']
   */
  srcExclude?: string[]
  /**
   * Build output location, relative to the project root.
   * @default './.vitepress/dist'
   */
  outDir?: string
  /**
   * Directory for assets within the build output. Must not be outside
   * of `outDir`.
   * @default 'assets'
   */
  assetsDir?: string
  /**
   * Directory for cache files, relative to the project root.
   * @default './.vitepress/cache'
   */
  cacheDir?: string
  /**
   * Decides whether a page emits a preload link for an async chunk.
   * All chunks are preloaded by default.
   */
  shouldPreload?: (link: string, page: string) => boolean
  /**
   * Locale-specific configs, keyed by the locale's path prefix (with
   * `root` denoting the default locale).
   * @see https://vitepress.dev/guide/i18n
   */
  locales?: LocaleConfig<ThemeConfig>
  /**
   * Client router options.
   */
  router?: {
    /**
     * Prefetch the chunks of in-viewport links in idle time.
     * @default true
     */
    prefetchLinks?: boolean
  }
  /**
   * Dark mode handling:
   * - `true`: light by default, with a user toggle
   * - `'dark'`: dark by default, with a user toggle
   * - `false`: no dark mode
   * - `'force-dark'`: always dark
   * - `'force-auto'`: always follow the system preference
   * - options for `@vueuse/core`'s `useDark`
   * @default true
   */
  appearance?:
    | boolean
    | 'dark'
    | 'force-dark'
    | 'force-auto'
    | (Omit<UseDarkOptions, 'initialValue'> & { initialValue?: 'dark' })
  /**
   * Show the timestamp of each page's last git commit.
   * @default false
   */
  lastUpdated?: boolean
  /**
   * Custom props passed to the `<Content />` component.
   */
  contentProps?: Record<string, any>
  /**
   * Markdown rendering options.
   */
  markdown?: MarkdownOptions
  /**
   * Options passed to `@vitejs/plugin-vue`.
   */
  vue?: VuePluginOptions
  /**
   * Vite config to merge with the default one. `configFile` can point
   * to an additional vite config file to load, or be `false` to load
   * none.
   */
  vite?: ViteConfig & { configFile?: string | false }
  /**
   * Enable MPA / zero-JS mode: pages ship without a client-side
   * JavaScript payload and navigation does full page loads.
   * @experimental
   * @default false
   * @see https://vitepress.dev/guide/mpa-mode
   */
  mpa?: boolean
  /**
   * Don't fail builds due to dead links. Accepts `true` (ignore all),
   * `'localhostLinks'` (only ignore localhost links), or an array of
   * exact strings, regexes, and custom filter functions.
   * @default false
   */
  ignoreDeadLinks?:
    | boolean
    | 'localhostLinks'
    | (string | RegExp | ((link: string, source: string) => boolean))[]
  /**
   * Generate `/foo` instead of `/foo.html` for pages and internal
   * links. Requires matching support from the hosting platform.
   * @default false
   * @see https://vitepress.dev/guide/routing#generating-clean-url
   */
  cleanUrls?: boolean
  /**
   * Use web fonts instead of emitting font files to dist. The active
   * theme must import a file named `fonts.(s)css` for this to work. If
   * you are a theme author, to support this, place your web font import
   * between `webfont-marker-begin` and `webfont-marker-end` comments.
   * @experimental
   * @default true in webcontainers, else false
   */
  useWebFonts?: boolean
  /**
   * Number of pages rendered concurrently during the build. Lower
   * values reduce the memory usage at the cost of build time.
   * @default 64
   */
  buildConcurrency?: number
  /**
   * Source-to-destination page path mappings, or a function returning
   * the destination path for a source path. Used to serve pages at
   * URLs different from their directory structure.
   * @see https://vitepress.dev/guide/routing#route-rewrites
   */
  rewrites?: Record<string, string> | ((id: string) => string)
  /**
   * Generate a `sitemap.xml` during build. `transformItems` can adjust
   * the entries before they are written.
   * @see https://vitepress.dev/guide/sitemap-generation
   */
  sitemap?: SitemapStreamOptions & {
    hostname: string
    transformItems?: (items: SitemapItem[]) => Awaitable<SitemapItem[]>
  }
  /**
   * Build hook, called once after the site is fully built - e.g. to
   * generate an RSS feed.
   */
  buildEnd?: (siteConfig: SiteConfig<ThemeConfig>) => Awaitable<void>
  /**
   * Build hook, called after each page's SSG render - e.g. to handle
   * teleported content.
   */
  postRender?: (context: SSGContext) => Awaitable<SSGContext | void>
  /**
   * Build hook for adding head entries that cannot be statically
   * declared, called before a page's HTML is written to disk. Returned
   * entries are merged with the existing ones.
   */
  transformHead?: (
    ctx: TransformContext<ThemeConfig>
  ) => Awaitable<HeadConfig[] | void>
  /**
   * Build hook for transforming a page's final HTML, called before it
   * is written to disk.
   */
  transformHtml?: (
    code: string,
    id: string,
    ctx: TransformContext<ThemeConfig>
  ) => Awaitable<string | void>
  /**
   * Hook for augmenting the data of each page, applied when rendering
   * markdown to vue in both dev and build. Returned values are merged
   * into the page data.
   */
  transformPageData?: (
    pageData: PageData,
    ctx: TransformPageContext<ThemeConfig>
  ) => Awaitable<Partial<PageData> | { [key: string]: any } | void>
  /**
   * Multi-layer configuration overloading: additional configs that
   * apply to the pages in their directory and below, either as a dict
   * keyed by path or as a loader function.
   * Auto-resolves to `docs/.../config.{js,mjs,ts,mts}` when unspecified.
   *
   * Set to `{}` to opt-out.
   * @experimental
   */
  additionalConfig?:
    AdditionalConfigDict<ThemeConfig> | AdditionalConfigLoader<ThemeConfig>
}

/**
 * The resolved config, as exposed to build hooks and plugins.
 */
export interface SiteConfig<ThemeConfig = any> extends Pick<
  UserConfig<ThemeConfig>,
  | 'markdown'
  | 'vue'
  | 'vite'
  | 'shouldPreload'
  | 'router'
  | 'mpa'
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
  /**
   * Absolute path of the project root (the directory containing
   * `.vitepress`).
   */
  root: string
  /**
   * Absolute path of the directory containing the markdown sources.
   */
  srcDir: string
  /**
   * Absolute path of the public assets directory. Empty string when
   * disabled through vite's `publicDir` option.
   */
  publicDir: string
  /**
   * The resolved site data.
   */
  site: SiteData<ThemeConfig>
  /**
   * Absolute path of the loaded config file, if any.
   */
  configPath: string | undefined
  /**
   * Absolute paths of the files the config depends on, watched to
   * restart the dev server.
   */
  configDeps: string[]
  /**
   * Absolute path of the active theme's directory.
   */
  themeDir: string
  /**
   * Absolute path of the build output directory.
   */
  outDir: string
  /**
   * Directory for assets within the build output.
   */
  assetsDir: string
  /**
   * Absolute path of the cache directory.
   */
  cacheDir: string
  /**
   * Absolute path of the temp directory used during the build.
   */
  tempDir: string
  /**
   * Markdown source paths, relative to `srcDir`.
   */
  pages: string[]
  /**
   * The resolved dynamic routes.
   */
  dynamicRoutes: ResolvedRouteConfig[]
  /**
   * The resolved page rewrites: `map` goes from source path to
   * rewritten path, `inv` the other way around.
   */
  rewrites: {
    map: Record<string, string | undefined>
    inv: Record<string, string | undefined>
  }
  /**
   * The logger used by vite.
   */
  logger: Logger
  /**
   * The raw user config this config was resolved from.
   */
  userConfig: UserConfig<ThemeConfig>
  /**
   * Number of pages rendered concurrently during the build.
   */
  buildConcurrency: number
}
