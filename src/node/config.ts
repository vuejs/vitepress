import { createDebug } from 'obug'
import fs from 'fs-extra'
import path from 'node:path'
import c from 'picocolors'
import {
  createLogger,
  loadConfigFromFile,
  mergeConfig as mergeViteConfig,
  normalizePath,
  type ConfigEnv
} from 'vite'
import { DEFAULT_THEME_PATH } from './alias'
import type { DefaultTheme } from './defaultTheme'
import { resolvePages } from './plugins/dynamicRoutesPlugin'
import {
  APPEARANCE_KEY,
  VP_SOURCE_KEY,
  isObject,
  slash,
  type AdditionalConfig,
  type Awaitable,
  type HeadConfig,
  type SiteData
} from './shared'
import type { RawConfigExports, SiteConfig, UserConfig } from './siteConfig'
import { glob } from './utils/glob'

export { resolvePages } from './plugins/dynamicRoutesPlugin'
export { resolveSiteDataByRoute } from './shared'
export * from './siteConfig'

const debug = createDebug('vitepress:config')

const resolve = (root: string, file: string) =>
  normalizePath(path.resolve(root, `.vitepress`, file))

export type { ConfigEnv }
export type UserConfigFn<ThemeConfig> = (
  env: ConfigEnv
) => Awaitable<UserConfig<ThemeConfig>>
export type UserConfigExport<ThemeConfig> =
  | Awaitable<UserConfig<ThemeConfig>>
  | UserConfigFn<ThemeConfig>

/**
 * Type config helper
 */
export function defineConfig<ThemeConfig = DefaultTheme.Config>(
  config: UserConfig<NoInfer<ThemeConfig>>
) {
  return config
}

export type AdditionalConfigFn<ThemeConfig> = (
  env: ConfigEnv
) => Awaitable<AdditionalConfig<ThemeConfig>>
export type AdditionalConfigExport<ThemeConfig> =
  | Awaitable<AdditionalConfig<ThemeConfig>>
  | AdditionalConfigFn<ThemeConfig>

/**
 *  Type config helper for additional/locale-specific config
 */
export function defineAdditionalConfig<ThemeConfig = DefaultTheme.Config>(
  config: AdditionalConfig<NoInfer<ThemeConfig>>
) {
  return config
}

/**
 * Type config helper for custom theme config
 *
 * @deprecated use `defineConfig` instead
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
    ? slash(userConfig.assetsDir).replace(/^\.?\/|\/$/g, '')
    : 'assets'
  const outDir = userConfig.outDir
    ? normalizePath(path.resolve(root, userConfig.outDir))
    : resolve(root, 'dist')
  const cacheDir = userConfig.cacheDir
    ? normalizePath(path.resolve(root, userConfig.cacheDir))
    : resolve(root, 'cache')

  const resolvedAssetsDir = normalizePath(path.resolve(outDir, assetsDir))
  if (!resolvedAssetsDir.startsWith(outDir)) {
    throw new Error(
      [
        `assetsDir cannot be set to a location outside of the outDir.`,
        `outDir: ${outDir}`,
        `assetsDir: ${assetsDir}`,
        `resolved: ${resolvedAssetsDir}`
      ].join('\n  ')
    )
  }

  // resolve theme path
  const userThemeDir = resolve(root, 'theme')
  const themeDir = (await fs.pathExists(userThemeDir))
    ? userThemeDir
    : DEFAULT_THEME_PATH

  const config: Omit<SiteConfig, 'pages' | 'dynamicRoutes' | 'rewrites'> = {
    root,
    srcDir,
    assetsDir,
    site,
    themeDir,
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
    userConfig,
    sitemap: userConfig.sitemap,
    buildConcurrency: userConfig.buildConcurrency ?? 64
  }

  // to be shared with content loaders
  // @ts-ignore
  global.VITEPRESS_CONFIG = config

  // resolve pages after setting global, so that path loaders can access it
  await resolvePages(config, true)

  return config as SiteConfig
}

const supportedConfigExtensions = ['js', 'ts', 'mjs', 'mts']
const additionalConfigRE = /(?:^|\/|\\)config\.m?[jt]s$/
const additionalConfigGlob = `**/config.{js,mjs,ts,mts}`

export function isAdditionalConfigFile(path: string) {
  return additionalConfigRE.test(path)
}

async function gatherAdditionalConfig(
  root: string,
  command: 'serve' | 'build',
  mode: string,
  srcDir: string = '.',
  srcExclude: string[] = []
) {
  //

  const candidates = await glob([additionalConfigGlob], {
    cwd: path.resolve(root, srcDir),
    ignore: srcExclude
  })

  const deps: string[][] = []

  const exports = await Promise.all(
    candidates.map(async (file) => {
      const id = normalizePath(`/${path.dirname(file)}/`)

      const configExports = await loadConfigFromFile(
        { command, mode },
        normalizePath(path.resolve(root, srcDir, file)),
        root
      ).catch(console.error) // Skip additionalConfig file if it fails to load

      if (!configExports) {
        debug(`Failed to load additional config from ${file}`)
        return
      }

      deps.push(
        configExports.dependencies.map((file) =>
          normalizePath(path.resolve(file))
        )
      )

      if (mode === 'development') {
        ;(configExports.config as any)[VP_SOURCE_KEY] = '/' + slash(file)
      }

      return [id, configExports.config as AdditionalConfig] as const
    })
  )

  return [Object.fromEntries(exports.filter((e) => e != null)), deps] as const
}

export async function resolveUserConfig(
  root: string,
  command: 'serve' | 'build',
  mode: string
): Promise<[UserConfig, configPath: string | undefined, configDeps: string[]]> {
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

  // Auto-generate additional config if user leaves it unspecified
  if (userConfig.additionalConfig === undefined) {
    const [additionalConfig, additionalDeps] = await gatherAdditionalConfig(
      root,
      command,
      mode,
      userConfig.srcDir,
      userConfig.srcExclude
    )
    userConfig.additionalConfig = additionalConfig
    configDeps = configDeps.concat(...additionalDeps)
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

export function mergeConfig(a: UserConfig, b: UserConfig, isRoot = true) {
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
    router: {
      prefetchLinks: userConfig.router?.prefetchLinks ?? true
    },
    appearance: userConfig.appearance ?? true,
    themeConfig: userConfig.themeConfig || {},
    locales: userConfig.locales || {},
    scrollOffset: userConfig.scrollOffset ?? 134,
    cleanUrls: !!userConfig.cleanUrls,
    contentProps: userConfig.contentProps,
    additionalConfig: userConfig.additionalConfig
  }
}

function resolveSiteDataHead(userConfig?: UserConfig): HeadConfig[] {
  const head = userConfig?.head ?? []
  if (userConfig?.mpa) return head

  // add inline script to apply dark mode, if user enables the feature.
  // this is required to prevent "flash" on initial page load.
  if (userConfig?.appearance ?? true) {
    // if appearance mode set to light or dark, default to the defined mode
    // in case the user didn't specify a preference - otherwise, default to auto
    const fallbackPreference =
      typeof userConfig?.appearance === 'string'
        ? userConfig?.appearance
        : typeof userConfig?.appearance === 'object'
          ? (userConfig.appearance.initialValue ?? 'auto')
          : 'auto'

    head.push([
      'script',
      { id: 'check-dark-mode' },
      fallbackPreference === 'force-dark'
        ? `document.documentElement.classList.add('dark')`
        : fallbackPreference === 'force-auto'
          ? `;(() => {
               if (window.matchMedia('(prefers-color-scheme: dark)').matches)
                 document.documentElement.classList.add('dark')
             })()`
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
