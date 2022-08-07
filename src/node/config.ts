import path from 'path'
import fs from 'fs-extra'
import c from 'picocolors'
import fg from 'fast-glob'
import {
  normalizePath,
  AliasOptions,
  UserConfig as ViteConfig,
  mergeConfig as mergeViteConfig,
  loadConfigFromFile
} from 'vite'
import { Options as VuePluginOptions } from '@vitejs/plugin-vue'
import {
  SiteData,
  HeadConfig,
  LocaleConfig,
  DefaultTheme,
  APPEARANCE_KEY,
  createLangDictionary,
  PageData
} from './shared'
import { resolveAliases, DEFAULT_THEME_PATH } from './alias'
import { MarkdownOptions } from './markdown/markdown'
import _debug from 'debug'

export { resolveSiteDataByRoute } from './shared'

const debug = _debug('vitepress:config')

export interface UserConfig<ThemeConfig = any> {
  extends?: RawConfigExports<ThemeConfig>
  base?: string
  lang?: string
  title?: string
  titleTemplate?: string | boolean
  description?: string
  head?: HeadConfig[]
  appearance?: boolean
  themeConfig?: ThemeConfig
  locales?: Record<string, LocaleConfig>
  markdown?: MarkdownOptions
  lastUpdated?: boolean
  /**
   * Options to pass on to `@vitejs/plugin-vue`
   */
  vue?: VuePluginOptions
  /**
   * Vite config
   */
  vite?: ViteConfig

  srcDir?: string
  srcExclude?: string[]
  outDir?: string
  shouldPreload?: (link: string, page: string) => boolean

  /**
   * Configure the scroll offset when the theme has a sticky header.
   * Can be a number or a selector element to get the offset from.
   */
  scrollOffset?: number | string

  /**
   * Enable MPA / zero-JS mode
   * @experimental
   */
  mpa?: boolean

  /**
   * Don't fail builds due to dead links.
   *
   * @default false
   */
  ignoreDeadLinks?: boolean

  /**
   * Build end hook: called when SSG finish.
   * @param siteConfig The resolved configuration.
   */
  buildEnd?: (siteConfig: SiteConfig) => Promise<void>

  /**
   * HTML transform hook: runs before writing HTML to dist.
   */
  transformHtml?: (
    code: string,
    id: string,
    ctx: {
      siteConfig: SiteConfig
      siteData: SiteData
      pageData: PageData
      title: string
      description: string
      head: HeadConfig[]
      content: string
    }
  ) => Promise<string | void>
}

export type RawConfigExports<ThemeConfig = any> =
  | UserConfig<ThemeConfig>
  | Promise<UserConfig<ThemeConfig>>
  | (() => UserConfig<ThemeConfig> | Promise<UserConfig<ThemeConfig>>)

export interface SiteConfig<ThemeConfig = any>
  extends Pick<
    UserConfig,
    | 'markdown'
    | 'vue'
    | 'vite'
    | 'shouldPreload'
    | 'mpa'
    | 'lastUpdated'
    | 'ignoreDeadLinks'
    | 'buildEnd'
    | 'transformHtml'
  > {
  root: string
  srcDir: string
  site: SiteData<ThemeConfig>
  configPath: string | undefined
  configDeps: string[]
  themeDir: string
  outDir: string
  tempDir: string
  alias: AliasOptions
  pages: string[]
}

const resolve = (root: string, file: string) =>
  normalizePath(path.resolve(root, `.vitepress`, file))

/**
 * Type config helper
 */
export function defineConfig(config: UserConfig<DefaultTheme.Config>) {
  return config
}

/**
 * Type config helper for custom theme config
 */
export function defineConfigWithTheme<ThemeConfig>(
  config: UserConfig<ThemeConfig>
) {
  return config
}

export async function resolveConfig(
  root: string = process.cwd(),
  command: 'serve' | 'build' = 'serve',
  mode = 'development'
): Promise<SiteConfig> {
  const [userConfig, configPath, configDeps] = await resolveUserConfig(
    root,
    command,
    mode
  )
  const site = await resolveSiteData(root, userConfig)
  const srcDir = path.resolve(root, userConfig.srcDir || '.')
  const outDir = userConfig.outDir
    ? path.resolve(root, userConfig.outDir)
    : resolve(root, 'dist')

  // resolve theme path
  const userThemeDir = resolve(root, 'theme')
  const themeDir = (await fs.pathExists(userThemeDir))
    ? userThemeDir
    : DEFAULT_THEME_PATH

  // Important: fast-glob doesn't guarantee order of the returned files.
  // We must sort the pages so the input list to rollup is stable across
  // builds - otherwise different input order could result in different exports
  // order in shared chunks which in turns invalidates the hash of every chunk!
  // JavaScript built-in sort() is mandated to be stable as of ES2019 and
  // supported in Node 12+, which is required by Vite.
  const pages = (
    await fg(['**.md'], {
      cwd: srcDir,
      ignore: ['**/node_modules', ...(userConfig.srcExclude || [])]
    })
  ).sort()

  const config: SiteConfig = {
    root,
    srcDir,
    site,
    themeDir,
    pages,
    configPath,
    configDeps,
    outDir,
    tempDir: resolve(root, '.temp'),
    markdown: userConfig.markdown,
    lastUpdated: userConfig.lastUpdated,
    alias: resolveAliases(root, themeDir),
    vue: userConfig.vue,
    vite: userConfig.vite,
    shouldPreload: userConfig.shouldPreload,
    mpa: !!userConfig.mpa,
    ignoreDeadLinks: userConfig.ignoreDeadLinks,
    buildEnd: userConfig.buildEnd,
    transformHtml: userConfig.transformHtml
  }

  return config
}

const supportedConfigExtensions = ['js', 'ts', 'mjs', 'mts']

async function resolveUserConfig(
  root: string,
  command: 'serve' | 'build',
  mode: string
): Promise<[UserConfig, string | undefined, string[]]> {
  // load user config
  const configPath = supportedConfigExtensions
    .map((ext) => resolve(root, `config.${ext}`))
    .find(fs.pathExistsSync)

  let userConfig: RawConfigExports = {}
  let configDeps: string[] = []
  if (!configPath) {
    debug(`no config file found.`)
  } else {
    const configExports = await loadConfigFromFile(
      { command, mode },
      configPath,
      root
    )
    if (configExports) {
      userConfig = configExports.config
      configDeps = configExports.dependencies.map((file) =>
        normalizePath(path.resolve(file))
      )
    }
    debug(`loaded config at ${c.yellow(configPath)}`)
  }

  return [await resolveConfigExtends(userConfig), configPath, configDeps]
}

async function resolveConfigExtends(
  config: RawConfigExports
): Promise<UserConfig> {
  const resolved = await (typeof config === 'function' ? config() : config)
  if (resolved.extends) {
    const base = await resolveConfigExtends(resolved.extends)
    return mergeConfig(base, resolved)
  }
  return resolved
}

function mergeConfig(a: UserConfig, b: UserConfig, isRoot = true) {
  const merged: Record<string, any> = { ...a }
  for (const key in b) {
    const value = b[key as keyof UserConfig]
    if (value == null) {
      continue
    }
    const existing = merged[key]
    if (Array.isArray(existing) && Array.isArray(value)) {
      merged[key] = [...existing, ...value]
      continue
    }
    if (isObject(existing) && isObject(value)) {
      if (isRoot && key === 'vite') {
        merged[key] = mergeViteConfig(existing, value)
      } else {
        merged[key] = mergeConfig(existing, value, false)
      }
      continue
    }
    merged[key] = value
  }
  return merged
}

function isObject(value: unknown): value is Record<string, any> {
  return Object.prototype.toString.call(value) === '[object Object]'
}

export async function resolveSiteData(
  root: string,
  userConfig?: UserConfig,
  command: 'serve' | 'build' = 'serve',
  mode = 'development'
): Promise<SiteData> {
  userConfig = userConfig || (await resolveUserConfig(root, command, mode))[0]

  return {
    lang: userConfig.lang || 'en-US',
    title: userConfig.title || 'VitePress',
    titleTemplate: userConfig.titleTemplate,
    description: userConfig.description || 'A VitePress site',
    base: userConfig.base ? userConfig.base.replace(/([^/])$/, '$1/') : '/',
    head: resolveSiteDataHead(userConfig),
    appearance: userConfig.appearance ?? true,
    themeConfig: userConfig.themeConfig || {},
    locales: userConfig.locales || {},
    langs: createLangDictionary(userConfig),
    scrollOffset: userConfig.scrollOffset || 90
  }
}

function resolveSiteDataHead(userConfig?: UserConfig): HeadConfig[] {
  const head = userConfig?.head ?? []

  // add inline script to apply dark mode, if user enables the feature.
  // this is required to prevent "flush" on initial page load.
  if (userConfig?.appearance ?? true) {
    head.push([
      'script',
      { id: 'check-dark-light' },
      `
        ;(() => {
          const saved = localStorage.getItem('${APPEARANCE_KEY}')
          const prefereDark = window.matchMedia('(prefers-color-scheme: dark)').matches
          if (!saved || saved === 'auto' ? prefereDark : saved === 'dark') {
            document.documentElement.classList.add('dark')
          }
        })()
      `
    ])
  }

  return head
}
