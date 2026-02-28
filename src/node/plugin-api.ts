import type { Plugin as VitePlugin } from 'vite'
import type {
  Awaitable,
  HeadConfig,
  PageData,
  SSGContext
} from './shared'
import type { SiteConfig, TransformContext, TransformPageContext } from './siteConfig'

/**
 * Context object passed to page data transformation hooks
 */
export interface PageDataTransformContext<ThemeConfig = any>
  extends TransformPageContext<ThemeConfig> {}

/**
 * Context object passed to markdown transformation hooks
 */
export interface MarkdownTransformContext {
  siteConfig: SiteConfig
  filePath: string
  relativePath: string
}

/**
 * Context object passed to Vue transformation hooks
 */
export interface VueTransformContext {
  siteConfig: SiteConfig
  filePath: string
}

/**
 * Context object passed to head transformation hooks
 */
export interface HeadTransformContext<ThemeConfig = any>
  extends TransformContext<ThemeConfig> {}

/**
 * Context object passed to HTML transformation hooks
 */
export interface HtmlTransformContext<ThemeConfig = any>
  extends TransformContext<ThemeConfig> {}

/**
 * VitePress Plugin definition
 * Provides a unified way to extend VitePress functionality across all layers:
 * - Markdown processing
 * - Vue component handling
 * - Page data transformation
 * - HTML/Head modification
 * - SSG rendering
 * - Build lifecycle
 *
 * @example
 * ```typescript
 * import { definePlugin } from 'vitepress'
 *
 * export default definePlugin({
 *   name: 'my-plugin',
 *   transformPageData(pageData) {
 *     return {
 *       ...pageData,
 *       customField: 'value'
 *     }
 *   },
 *   transformHead(ctx) {
 *     return [['meta', { name: 'custom', content: 'value' }]]
 *   }
 * })
 * ```
 */
export interface VitePressPlugin<ThemeConfig = any> {
  /**
   * Plugin name - must be unique across all plugins
   */
  name: string

  /**
   * Plugin description
   */
  description?: string

  /**
   * Plugin version
   */
  version?: string

  /**
   * Whether this plugin should be applied.
   * Can be a boolean or a function that receives the resolved config.
   *
   * @default true
   */
  apply?:
    | boolean
    | 'serve'
    | 'build'
    | ((config: SiteConfig<ThemeConfig>) => boolean)

  /**
   * Hook to modify page data during markdown rendering
   *
   * This hook is called when markdown is being compiled to Vue.
   * It allows plugins to extend page metadata or modify page data.
   *
   * @param pageData The page data to transform
   * @param ctx Transform context containing siteConfig
   * @returns Partial page data updates or void
   */
  transformPageData?: (
    pageData: PageData,
    ctx: PageDataTransformContext<ThemeConfig>
  ) => Awaitable<Partial<PageData> | { [key: string]: any } | void>

  /**
   * Hook to modify the page head before writing HTML
   *
   * This hook is called during SSG before the HTML is written to disk.
   * It allows plugins to inject or modify meta tags, scripts, styles, etc.
   *
   * @param ctx Transform context with page information
   * @returns Array of head config entries or void
   */
  transformHead?: (
    ctx: HeadTransformContext<ThemeConfig>
  ) => Awaitable<HeadConfig[] | void>

  /**
   * Hook to modify HTML before writing to disk
   *
   * This hook is called after Vue rendering but before the HTML is written to disk.
   * It allows plugins to modify the final HTML output.
   *
   * @param code The HTML code
   * @param id The HTML file identifier
   * @param ctx Transform context with page information
   * @returns Modified HTML or void
   */
  transformHtml?: (
    code: string,
    id: string,
    ctx: HtmlTransformContext<ThemeConfig>
  ) => Awaitable<string | void>

  /**
   * Hook called after Vue SSR rendering is complete
   *
   * This hook is called after the Vue app has been rendered to HTML.
   * It allows plugins to modify the SSR context and rendered output.
   *
   * @param context The SSG context
   * @returns Modified SSG context or void
   */
  postRender?: (
    context: SSGContext
  ) => Awaitable<SSGContext | void>

  /**
   * Hook called after the entire build is complete
   *
   * This is the final hook in the build lifecycle.
   * Useful for post-processing or cleanup.
   *
   * @param config The resolved site config
   */
  buildEnd?: (config: SiteConfig<ThemeConfig>) => Awaitable<void>

  /**
   * Hook called when the config is resolved
   *
   * This hook is called after all configs are resolved and merged.
   * Useful for plugin initialization based on final config.
   *
   * @param config The resolved site config
   */
  configResolved?: (config: SiteConfig<ThemeConfig>) => void | Promise<void>

  /**
   * Vite plugins to be injected into the Vite config
   *
   * Return a single plugin or an array of plugins.
   * Useful for Vite-specific enhancements like custom resolvers, loaders, etc.
   *
   * @param config The resolved site config
   * @returns Vite plugin(s) or void
   */
  vitePlugin?: (
    config: SiteConfig<ThemeConfig>
  ) => VitePlugin | VitePlugin[] | void
}

/**
 * Helper function to define a VitePress plugin with proper type inference
 *
 * @param plugin The plugin definition
 * @returns The plugin definition
 *
 * @example
 * ```typescript
 * export default definePlugin({
 *   name: 'my-plugin',
 *   transformHead: (ctx) => [['meta', { name: 'foo' }]]
 * })
 * ```
 */
export function definePlugin<ThemeConfig = any>(
  plugin: VitePressPlugin<ThemeConfig>
): VitePressPlugin<ThemeConfig> {
  return plugin
}
