import _debug from 'debug'
import fs from 'fs-extra'
import path from 'path'
import c from 'picocolors'
import {
  createLogger,
  loadConfigFromFile,
  mergeConfig as mergeViteConfig,
  normalizePath,
  type ConfigEnv
} from 'vite'
import { DEFAULT_THEME_PATH } from './alias'
import { resolvePages } from './plugins/dynamicRoutesPlugin'
import {
  APPEARANCE_KEY,
  type DefaultTheme,
  type HeadConfig,
  type SiteData
} from './shared'
import type { RawConfigExports, SiteConfig, UserConfig } from './siteConfig'

export { resolvePages } from './plugins/dynamicRoutesPlugin'
export * from './siteConfig'

const debug = _debug('vitepress:config')

const resolve = (root: string, file: string) =>
  normalizePath(path.resolve(root, `.vitepress`, file))

export type UserConfigFn<ThemeConfig> = (
  env: ConfigEnv
) => UserConfig<ThemeConfig> | Promise<UserConfig<ThemeConfig>>
export type UserConfigExport<ThemeConfig> =
  | UserConfig<ThemeConfig>
  | Promise<UserConfig<ThemeConfig>>
  | UserConfigFn<ThemeConfig>

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
  // normalize root into absolute path
  root = normalizePath(path.resolve(root))

  const [userConfig, configPath, configDeps] = await resolveUserConfig(
    root,
    command,
    mode
  )

  const logger =
    userConfig.vite?.customLogger ??
    createLogger(userConfig.vite?.logLevel, {
      prefix: '[vitepress]',
      allowClearScreen: userConfig.vite?.clearScreen
    })
  const site = await resolveSiteData(root, userConfig)
  const srcDir = normalizePath(path.resolve(root, userConfig.srcDir || '.'))
  const assetsDir = userConfig.assetsDir
    ? userConfig.assetsDir.replace(/\//g, '')
    : 'assets'
  const outDir = userConfig.outDir
    ? normalizePath(path.resolve(root, userConfig.outDir))
    : resolve(root, 'dist')
  const cacheDir = userConfig.cacheDir
    ? normalizePath(path.resolve(root, userConfig.cacheDir))
    : resolve(root, 'cache')

  // resolve theme path
  const userThemeDir = resolve(root, 'theme')
  const themeDir = (await fs.pathExists(userThemeDir))
    ? userThemeDir
    : DEFAULT_THEME_PATH

  const { pages, dynamicRoutes, rewrites } = await resolvePages(
    srcDir,
    userConfig
  )

  const config: SiteConfig = {
    root,
    srcDir,
    srcExclude: userConfig.srcExclude || [],
    assetsDir,
    site,
    themeDir,
    pages,
    dynamicRoutes,
    configPath,
    configDeps,
    outDir,
    cacheDir,
    logger,
    tempDir: resolve(root, '.temp'),
    markdown: userConfig.markdown,
    lastUpdated:
      userConfig.lastUpdated ?? !!userConfig.themeConfig?.lastUpdated,
    vue: userConfig.vue,
    vite: userConfig.vite,
    shouldPreload: userConfig.shouldPreload,
    mpa: !!userConfig.mpa,
    metaChunk: !!userConfig.metaChunk,
    ignoreDeadLinks: userConfig.ignoreDeadLinks,
    cleanUrls: !!userConfig.cleanUrls,
    useWebFonts:
      userConfig.useWebFonts ??
      typeof process.versions.webcontainer === 'string',
    postRender: userConfig.postRender,
    buildEnd: userConfig.buildEnd,
    transformHead: userConfig.transformHead,
    transformHtml: userConfig.transformHtml,
    transformPageData: userConfig.transformPageData,
    rewrites,
    userConfig,
    sitemap: userConfig.sitemap
  }

  // to be shared with content loaders
  // @ts-ignore
  global.VITEPRESS_CONFIG = config

  return config
}

const supportedConfigExtensions = ['js', 'ts', 'mjs', 'mts']

export async function resolveUserConfig(
  root: string,
  command: 'serve' | 'build',
  mode: string
): Promise<[UserConfig, string | undefined, string[]]> {
  // load user config
  const configPath = supportedConfigExtensions
    .flatMap((ext) => [
      resolve(root, `config/index.${ext}`),
      resolve(root, `config.${ext}`)
    ])
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
    dir: userConfig.dir || 'ltr',
    title: userConfig.title || 'VitePress',
    titleTemplate: userConfig.titleTemplate,
    description: userConfig.description || 'A VitePress site',
    base: userConfig.base ? userConfig.base.replace(/([^/])$/, '$1/') : '/',
    head: resolveSiteDataHead(userConfig),
    appearance: userConfig.appearance ?? true,
    themeConfig: userConfig.themeConfig || {},
    locales: userConfig.locales || {},
    scrollOffset: userConfig.scrollOffset ?? 90,
    cleanUrls: !!userConfig.cleanUrls,
    contentProps: userConfig.contentProps
  }
}

function resolveSiteDataHead(userConfig?: UserConfig): HeadConfig[] {
  const head = userConfig?.head ?? []

  // add inline script to apply dark mode, if user enables the feature.
  // this is required to prevent "flash" on initial page load.
  if (userConfig?.appearance ?? true) {
    // if appearance mode set to light or dark, default to the defined mode
    // in case the user didn't specify a preference - otherwise, default to auto
    const fallbackPreference =
      typeof userConfig?.appearance === 'string'
        ? userConfig?.appearance
        : typeof userConfig?.appearance === 'object'
        ? userConfig.appearance.initialValue ?? 'auto'
        : 'auto'

    head.push([
      'script',
      { id: 'check-dark-mode' },
      fallbackPreference === 'force-dark'
        ? `document.documentElement.classList.add('dark')`
        : `;(() => {
            const preference = localStorage.getItem('${APPEARANCE_KEY}') || '${fallbackPreference}'
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
            if (!preference || preference === 'auto' ? prefersDark : preference === 'dark')
              document.documentElement.classList.add('dark')
          })()`
    ])
  }

  head.push([
    'script',
    { id: 'check-mac-os' },
    `document.documentElement.classList.toggle('mac', /Mac|iPhone|iPod|iPad/i.test(navigator.platform))`
  ])

  return head
}
