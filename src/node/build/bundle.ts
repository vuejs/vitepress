import fs from 'node:fs'
import { cp } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pMap from 'p-map'
import {
  build,
  normalizePath,
  type BuildOptions,
  type Plugin,
  type Rolldown,
  type InlineConfig as ViteInlineConfig
} from 'vite'
import { APP_PATH, DEFAULT_THEME_PATH } from '../alias'
import type { SiteConfig } from '../config'
import {
  createVitePressPlugin,
  type PageMeta,
  type VitePressPluginOptions
} from '../plugin'
import { escapeRegExp, sanitizeFileName, slash } from '../shared'
import { buildMPAClient } from './buildMPAClient'
import {
  captureClientAssetUrls,
  type ClientAssetMap,
  useClientAssetUrlsForSsr
} from './ssr/clientAssets'
import {
  collectSsrRuntimeBridges,
  createSsrRuntimeBridgePlugin,
  createSsrRuntimeInput,
  type SsrRuntimeBridgeMap
} from './ssr/runtimeBundle'

// https://github.com/vitejs/vite/blob/a55d0b34400e3360c4100d05e422ae9cf10fa07b/packages/vite/src/node/constants.ts#L50
const CSS_LANGS_RE =
  /\.(css|less|sass|scss|styl|stylus|pcss|postcss|sss)(?:$|\?)/

const clientDir = normalizePath(
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../client')
)

// these deps are also being used in the client code (outside of the theme)
// exclude them from the theme chunk so there is no circular dependency
const excludedModules = [
  '/@siteData',
  'node_modules/@vueuse/core/',
  'node_modules/@vueuse/shared/',
  'node_modules/vue/',
  clientDir
]

const cache = new Map<string, boolean>()
const cacheTheme = new Map<string, boolean>()

const disableIsolatedSsrPublicCopyPlugin: Plugin = {
  name: 'vitepress:isolated-ssr-public-copy',
  enforce: 'post',
  config: {
    order: 'post',
    handler(config) {
      // The user Vite config merges after the inline build config. Reapply this
      // value after user hooks so SSR output never receives the public tree.
      const build = (config.build ??= {})
      build.copyPublicDir = false
      if (config.environments?.ssr?.build) {
        config.environments.ssr.build.copyPublicDir = false
      }
    }
  }
}

interface FullBundleTarget {
  mode: 'full'
  vitePressPluginOptions?: VitePressPluginOptions
}

interface ClientBundleTarget {
  mode: 'client'
  vitePressPluginOptions?: VitePressPluginOptions
}

interface SsrRuntimeBundleTarget {
  mode: 'ssr-runtime'
  outDir: string
  clientAssetMap: ClientAssetMap
}

export type BundleTarget =
  FullBundleTarget | ClientBundleTarget | SsrRuntimeBundleTarget

export interface BundleResult {
  clientResult: Rolldown.RolldownOutput | null
  serverResult: Rolldown.RolldownOutput | null
  pageToHashMap: Record<string, string>
  clientAssetMap: ClientAssetMap
  ssrRuntimeBridgeMap: SsrRuntimeBridgeMap
}

export interface FullBundleResult extends BundleResult {
  serverResult: Rolldown.RolldownOutput
}

export interface ClientBundleResult extends BundleResult {
  serverResult: null
}

export interface SsrRuntimeBundleResult extends BundleResult {
  clientResult: null
  serverResult: Rolldown.RolldownOutput
}

export interface ViteBuildConfigOptions {
  ssr: boolean
  pages?: string[]
  outDir?: string
  isolatedSsr?: boolean
  runtime?: boolean
  pageToHashMap?: Record<string, string>
  clientJSMap?: Record<string, string>
  pageMetaMap?: Record<string, PageMeta>
  clientAssetMap?: ClientAssetMap
  /** @internal Runtime source identities that require emitted entry facades. */
  ssrRuntimeBridgeModuleIds?: Set<string>
  vitePressPluginOptions?: VitePressPluginOptions
}

/**
 * Create the Vite config for the client, legacy SSR, SSR runtime, and page
 * artifact compiler. Keep aliases, definitions, and plugin behavior consistent
 * across these build paths.
 */
export async function createViteBuildConfig(
  config: SiteConfig,
  buildOptions: BuildOptions,
  target: ViteBuildConfigOptions
): Promise<ViteInlineConfig> {
  const {
    ssr,
    pages = config.pages,
    outDir = config.tempDir,
    isolatedSsr = false,
    runtime = false,
    pageToHashMap = Object.create(null) as Record<string, string>,
    clientJSMap = Object.create(null) as Record<string, string>,
    pageMetaMap,
    clientAssetMap,
    ssrRuntimeBridgeModuleIds = new Set<string>(),
    vitePressPluginOptions
  } = target

  if (runtime && !ssr) {
    throw new Error('The shared SSR runtime must use an SSR Vite config.')
  }

  const createPageInput = () => {
    const input: Record<string, string> = {}
    pages.forEach((file) => {
      // Convert the page file name: foo/bar.md -> foo_bar.md.
      const alias = config.rewrites.map[file] || file
      input[slash(alias).replace(/\//g, '_')] = path.resolve(
        config.srcDir,
        file
      )
    })
    return input
  }

  const themeEntryRE = new RegExp(
    `^${escapeRegExp(slash(path.resolve(config.themeDir, 'index.js'))).slice(0, -2)}m?(j|t)s`
  )

  const {
    rollupOptions,
    rolldownOptions = rollupOptions,
    ...restOptions
  } = buildOptions

  const input = runtime
    ? createSsrRuntimeInput(config, ssrRuntimeBridgeModuleIds)
    : {
        app: path.resolve(APP_PATH, ssr ? 'ssr.js' : 'index.js'),
        ...createPageInput()
      }

  return {
    root: config.srcDir,
    cacheDir: config.cacheDir,
    base: config.site.base,
    logLevel: config.vite?.logLevel ?? 'warn',
    plugins: [
      ...(await createVitePressPlugin(
        config,
        ssr,
        pageToHashMap,
        clientJSMap,
        pageMetaMap,
        undefined,
        { ...vitePressPluginOptions, isSsrBatch: isolatedSsr }
      )),
      ...(!ssr && clientAssetMap
        ? [captureClientAssetUrls(config, clientAssetMap)]
        : []),
      ...(ssr && runtime && clientAssetMap
        ? [useClientAssetUrlsForSsr(clientAssetMap)]
        : []),
      ...(ssr &&
      runtime &&
      normalizePath(config.themeDir) !== normalizePath(DEFAULT_THEME_PATH)
        ? [createSsrRuntimeBridgePlugin(ssrRuntimeBridgeModuleIds)]
        : []),
      ...(isolatedSsr ? [disableIsolatedSsrPublicCopyPlugin] : [])
    ],
    ssr: { noExternal: ['vitepress', '@docsearch/css'] },
    build: {
      ...restOptions,
      emptyOutDir: true,
      copyPublicDir: isolatedSsr ? false : restOptions.copyPublicDir,
      ssr,
      ssrEmitAssets: config.mpa,
      minify: ssr
        ? runtime
          ? (buildOptions.minify ?? (process.env.DEBUG ? false : 'oxc'))
          : !!config.mpa
        : (buildOptions.minify ?? !process.env.DEBUG),
      outDir: ssr ? outDir : config.outDir,
      cssCodeSplit: false,
      rolldownOptions: {
        ...rolldownOptions,
        input,
        // important so that each page chunk and the index export things for
        // each other
        preserveEntrySignatures: runtime ? 'strict' : 'allow-extension',
        output: {
          sanitizeFileName,
          ...rolldownOptions?.output,
          assetFileNames: `${config.assetsDir}/[name].[hash].[ext]`,
          ...(ssr
            ? {
                entryFileNames: '[name].js',
                chunkFileNames: '[name].[hash].js'
              }
            : {
                entryFileNames: `${config.assetsDir}/[name].[hash].js`,
                chunkFileNames(chunk) {
                  // avoid ads chunk being intercepted by adblock
                  return /(?:Carbon|BuySell)Ads/.test(chunk.name)
                    ? `${config.assetsDir}/chunks/[hash].js`
                    : `${config.assetsDir}/chunks/[name].[hash].js`
                },
                codeSplitting: {
                  groups: [{ name: chunkName.bind(null, themeEntryRE) }]
                }
              })
        },
        checks: { pluginTimings: false, ...rolldownOptions?.checks }
      }
    },
    configFile: config.vite?.configFile
  }
}

// Bundle the VitePress app for the client, server, or both.
export function bundle(
  config: SiteConfig,
  options: BuildOptions,
  pageMetaMap?: Record<string, PageMeta>
): Promise<FullBundleResult>
export function bundle(
  config: SiteConfig,
  options: BuildOptions,
  pageMetaMap: Record<string, PageMeta> | undefined,
  target: FullBundleTarget
): Promise<FullBundleResult>
export function bundle(
  config: SiteConfig,
  options: BuildOptions,
  pageMetaMap: Record<string, PageMeta> | undefined,
  target: ClientBundleTarget
): Promise<ClientBundleResult>
export function bundle(
  config: SiteConfig,
  options: BuildOptions,
  pageMetaMap: Record<string, PageMeta> | undefined,
  target: SsrRuntimeBundleTarget
): Promise<SsrRuntimeBundleResult>
export function bundle(
  config: SiteConfig,
  options: BuildOptions,
  pageMetaMap: Record<string, PageMeta> | undefined,
  target: BundleTarget
): Promise<BundleResult>
export async function bundle(
  config: SiteConfig,
  options: BuildOptions,
  pageMetaMap?: Record<string, PageMeta>,
  target: BundleTarget = { mode: 'full' }
): Promise<BundleResult> {
  const pageToHashMap = Object.create(null) as Record<string, string>
  const clientJSMap = Object.create(null) as Record<string, string>
  const clientAssetMap = Object.create(null) as ClientAssetMap
  let ssrRuntimeBridgeMap = Object.create(null) as SsrRuntimeBridgeMap

  let clientResult: Rolldown.RolldownOutput | null = null
  let serverResult: Rolldown.RolldownOutput | null = null

  if (target.mode === 'ssr-runtime') {
    if (config.mpa) {
      throw new Error('The shared SSR runtime is not compatible with MPA mode.')
    }
    const ssrRuntimeBridgeModuleIds = new Set<string>()
    serverResult = (await build(
      await createViteBuildConfig(config, options, {
        ssr: true,
        pages: [],
        outDir: target.outDir,
        isolatedSsr: true,
        runtime: true,
        pageToHashMap,
        clientJSMap,
        pageMetaMap,
        clientAssetMap: target.clientAssetMap,
        ssrRuntimeBridgeModuleIds
      })
    )) as Rolldown.RolldownOutput
    ssrRuntimeBridgeMap = collectSsrRuntimeBridges(
      serverResult,
      target.outDir,
      ssrRuntimeBridgeModuleIds
    )
    return {
      clientResult,
      serverResult,
      pageToHashMap,
      clientAssetMap,
      ssrRuntimeBridgeMap
    }
  }

  if (!config.mpa) {
    clientResult = (await build(
      await createViteBuildConfig(config, options, {
        ssr: false,
        pageToHashMap,
        clientJSMap,
        pageMetaMap,
        clientAssetMap: target.mode === 'client' ? clientAssetMap : undefined,
        vitePressPluginOptions: target.vitePressPluginOptions
      })
    )) as Rolldown.RolldownOutput
  }

  if (target.mode === 'full') {
    serverResult = (await build(
      await createViteBuildConfig(config, options, {
        ssr: true,
        pageToHashMap,
        clientJSMap,
        pageMetaMap,
        vitePressPluginOptions: target.vitePressPluginOptions
      })
    )) as Rolldown.RolldownOutput
  }

  if (config.mpa) {
    // in MPA mode, we need to copy over the non-js asset files from the
    // server build since there is no client-side build.
    await pMap(
      serverResult!.output,
      async (chunk) => {
        if (!chunk.fileName.endsWith('.js')) {
          const tempPath = path.resolve(config.tempDir, chunk.fileName)
          const outPath = path.resolve(config.outDir, chunk.fileName)
          await cp(tempPath, outPath)
        }
      },
      { concurrency: config.buildConcurrency }
    )

    // also copy over public dir
    const { publicDir } = config
    if (publicDir && fs.existsSync(publicDir)) {
      // dereference symlinks like vite's own publicDir copy does, and so that
      // copying over an existing symlinked file does not fail with EEXIST
      await cp(publicDir, config.outDir, { recursive: true, dereference: true })
    }

    // build <script client> bundle
    if (Object.keys(clientJSMap).length) {
      clientResult = await buildMPAClient(clientJSMap, config)
    }
  }

  // sort pageToHashMap to ensure stable output
  const sortedPageToHashMap = Object.create(null) as Record<string, string>
  Object.keys(pageToHashMap)
    .sort()
    .forEach((key) => {
      sortedPageToHashMap[key] = pageToHashMap[key]
    })

  return {
    clientResult,
    serverResult,
    pageToHashMap: sortedPageToHashMap,
    clientAssetMap,
    ssrRuntimeBridgeMap
  }
}

function chunkName(
  themeEntryRE: RegExp,
  id: string,
  ctx: { getModuleInfo: Rolldown.GetModuleInfo }
): string | undefined {
  const getModuleInfo = ctx.getModuleInfo.bind(ctx)

  // avoid emitting multiple files for assets
  // see: https://github.com/rolldown/rolldown/issues/4246
  if (getModuleInfo(id)?.meta['vite:asset']) {
    return 'assets'
  }

  // move known framework code into a stable chunk so that
  // custom theme changes do not invalidate hash for all pages
  if (
    id.startsWith('\0vite') ||
    id.includes('plugin-vue:export-helper') ||
    (id.includes(`${clientDir}/app`) && id !== `${clientDir}/app/index.js`) ||
    (isEagerChunk(id, getModuleInfo) &&
      /@vue\/(runtime|shared|reactivity)/.test(id))
  ) {
    return 'framework'
  }

  if (
    (id.startsWith(`${clientDir}/theme-default`) ||
      !excludedModules.some((i) => id.includes(i))) &&
    staticImportedByEntry(id, getModuleInfo, cacheTheme, themeEntryRE)
  ) {
    return 'theme'
  }
}

/**
 * Check if a module is statically imported by at least one entry.
 */
function isEagerChunk(id: string, getModuleInfo: Rolldown.GetModuleInfo) {
  if (
    id.includes('node_modules') &&
    !CSS_LANGS_RE.test(id) &&
    staticImportedByEntry(id, getModuleInfo, cache)
  ) {
    return true
  }
}

function staticImportedByEntry(
  id: string,
  getModuleInfo: Rolldown.GetModuleInfo,
  cache: Map<string, boolean>,
  entryRE: RegExp | null = null,
  importStack: string[] = []
): boolean {
  if (cache.has(id)) {
    return !!cache.get(id)
  }
  if (importStack.includes(id)) {
    // circular deps!
    cache.set(id, false)
    return false
  }
  const mod = getModuleInfo(id)
  if (!mod) {
    cache.set(id, false)
    return false
  }

  if (entryRE ? entryRE.test(id) : mod.isEntry) {
    cache.set(id, true)
    return true
  }
  const someImporterIs = mod.importers.some((importer: string) =>
    staticImportedByEntry(
      importer,
      getModuleInfo,
      cache,
      entryRE,
      importStack.concat(id)
    )
  )
  cache.set(id, someImporterIs)
  return someImporterIs
}
