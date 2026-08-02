import { createHash } from 'node:crypto'
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
  type RenderBuiltAssetUrl,
  type Rolldown,
  type InlineConfig as ViteInlineConfig
} from 'vite'
import { APP_PATH, DEFAULT_THEME_PATH, DIST_CLIENT_PATH } from '../alias'
import type { SiteConfig } from '../config'
import {
  createVitePressPlugin,
  type PageMeta,
  type VitePressPluginOptions
} from '../plugin'
import { escapeRegExp, sanitizeFileName, slash } from '../shared'
import { buildMPAClient } from './buildMPAClient'

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

export type ClientAssetMap = Record<string, string>
export type SsrRuntimeBridgeMap = Record<string, string>

const builtAssetRE = /__VITE_ASSET__([\w$]+)__(?:\$_(.*?)__)?/
const publicAssetRE = /__VITE_PUBLIC_ASSET__[a-z\d]{8}__/
const rawQueryRE = /(?:\?|&)raw(?:&|$)/
const declarationSourceRE = /\.d\.[cm]?ts$/
const dependencyPathRE = /(?:^|\/)node_modules(?:\/|$)/
const knownAssetSourceRE =
  /\.(?:apng|bmp|png|jpe?g|jfif|pjpeg|pjp|gif|svg|ico|webp|avif|cur|jxl|mp4|webm|ogg|mp3|wav|flac|aac|opus|mov|m4a|vtt|woff2?|eot|ttf|otf|webmanifest|pdf|txt)(?:$|[?#])/i
const nonRuntimeModuleQueryRE =
  /(?:\?|&)(?:raw|url|inline|worker|sharedworker|init|direct)(?:[=&]|$)|\?vue&type=(?:style|custom)(?:&|$)/

function encodeURIPath(uri: string): string {
  if (uri.startsWith('data:')) return uri
  const postfixIndex = uri.search(/[?#]/)
  const filePath = postfixIndex < 0 ? uri : uri.slice(0, postfixIndex)
  const postfix = postfixIndex < 0 ? '' : uri.slice(postfixIndex)
  return encodeURI(filePath) + postfix
}

function removeUrlQuery(url: string): string {
  return url.replace(/(\?|&)url(?:&|$)/, '$1').replace(/[?&]$/, '')
}

/** @internal Exported for focused pipeline tests. */
export function captureClientAssetUrls(
  config: SiteConfig,
  assetMap: ClientAssetMap
): Plugin {
  const pending = new Map<
    string,
    | { type: 'asset'; referenceId: string; postfix: string }
    | { type: 'public'; url: string }
  >()
  let renderBuiltUrl: RenderBuiltAssetUrl | undefined

  const resolveBuiltUrl = (
    filename: string,
    type: 'asset' | 'public',
    hostId: string
  ) => {
    const custom = renderBuiltUrl?.(filename, {
      type,
      hostId,
      hostType: 'js',
      // SSR uses these URLs, but they must identify files from the client
      // build.
      ssr: true
    })
    if (typeof custom === 'string') {
      if (custom) return custom
    } else if (custom?.runtime) {
      throw new Error(
        `ssrBuildBatchSize cannot materialize the runtime renderBuiltUrl expression for ${filename}. Return a URL string for SSR assets instead.`
      )
    }
    return slash(`${config.site.base}${filename.replace(/^\/+/, '')}`)
  }

  return {
    name: 'vitepress:ssr-client-asset-map',
    enforce: 'post',
    configResolved(resolved) {
      renderBuiltUrl = resolved.experimental.renderBuiltUrl
    },
    transform: {
      // Rolldown applies this filter without a JavaScript hook call. This
      // avoids calls for the app, Markdown pages, and Vue components.
      filter: {
        id: {
          exclude:
            /\.(?:[cm]?[jt]s|vue)(?:$|\?(?!url(?:&|#|$))(?![^#]*&url(?:&|#|$)))/
        }
      },
      handler(code, id) {
        const match = /^export default ("(?:[^"\\]|\\.)*")\s*;?\s*$/.exec(code)
        if (!match) return

        const value = JSON.parse(match[1]) as string
        const asset = builtAssetRE.exec(value)
        if (asset) {
          pending.set(normalizePath(id), {
            type: 'asset',
            referenceId: asset[1],
            // Vite preserves the query and hash postfix. Do not decode it
            // because `%` can be a literal character.
            postfix: asset[2] || ''
          })
        } else if (publicAssetRE.test(value)) {
          // An unbundled SSR environment otherwise returns a development URL.
          // Use the final client URL and remove only the `?url` control query.
          pending.set(normalizePath(id), {
            type: 'public',
            url: removeUrlQuery(id)
          })
        } else if (value.startsWith('data:') && !rawQueryRE.test(id)) {
          assetMap[normalizePath(id)] = value
        }
      }
    },
    generateBundle(_options, bundle) {
      const moduleHosts = new Map<string, string>()
      for (const output of Object.values(bundle)) {
        if (output.type !== 'chunk') continue
        for (const moduleId of output.moduleIds) {
          const normalizedId = normalizePath(moduleId)
          if (!moduleHosts.has(normalizedId)) {
            moduleHosts.set(normalizedId, output.fileName)
          }
        }
      }

      for (const [id, asset] of pending) {
        const hostId = moduleHosts.get(id) ?? id
        const filename =
          asset.type === 'asset'
            ? `${this.getFileName(asset.referenceId)}${asset.postfix}`
            : asset.url.replace(/^\/+/, '')
        assetMap[id] = encodeURIPath(
          resolveBuiltUrl(filename, asset.type, hostId)
        )
      }
    }
  }
}

function useClientAssetUrlsForSsr(assetMap: ClientAssetMap): Plugin {
  return {
    name: 'vitepress:ssr-client-asset-urls',
    enforce: 'pre',
    load(id) {
      // `load` and the client capture pass use the fully resolved ID. Handle it
      // here to avoid a second resolution and allow earlier custom loaders.
      const assetUrl = assetMap[normalizePath(id)]
      if (assetUrl === undefined) return
      return {
        code: `export default ${JSON.stringify(assetUrl)}`,
        moduleType: 'js'
      }
    }
  }
}

/** @internal Exported for focused pipeline tests. */
export function createSsrRuntimeInput(
  config: SiteConfig,
  bridgeModuleIds: Set<string> = new Set()
) {
  const input: Record<string, string> = {
    app: path.resolve(APP_PATH, 'ssrRuntime.js'),
    // These bridge entries share chunks with the app entry. Artifact runners
    // can externalize imports without duplicating injection symbols or Vue
    // state.
    vitepress: path.resolve(DIST_CLIENT_PATH, 'index.js'),
    theme: path.resolve(DEFAULT_THEME_PATH, 'index.js')
  }

  bridgeModuleIds.add(normalizePath(input.vitepress))
  bridgeModuleIds.add(normalizePath(input.theme))

  if (normalizePath(config.themeDir) === normalizePath(DEFAULT_THEME_PATH)) {
    return input
  }

  // Let Vite resolve the theme entry and custom extensions. Emit other bridge
  // facades only for sources that Rolldown finds in the runtime graph.
  input['site-theme'] = '@theme/index'
  return input
}

function isSsrRuntimeGraphSource(
  id: string,
  moduleInfo?: Pick<Rolldown.ModuleInfo, 'meta'>
): boolean {
  const sourceId = id.replace(/[?#].*$/, '')
  if (
    moduleInfo?.meta?.['vite:asset'] ||
    id.includes('#') ||
    nonRuntimeModuleQueryRE.test(id) ||
    declarationSourceRE.test(sourceId) ||
    CSS_LANGS_RE.test(id) ||
    knownAssetSourceRE.test(id)
  ) {
    return false
  }

  if (id.startsWith('\0')) {
    // Virtual JavaScript modules have no useful extension. Previous checks
    // rejected styles and assets. Pages cannot import declarations or Vite
    // implementation modules as source identities.
    return (
      !id.startsWith('\0vite/') &&
      !id.startsWith('\0vite:') &&
      !id.startsWith('\0plugin-vue:')
    )
  }

  // Keep Vite's normal SSR externalization for bare and native modules. Exclude
  // package files even when a plugin bundles a dependency. A bridge for each
  // package module would change Node's package semantics.
  if (!path.isAbsolute(id) || dependencyPathRE.test(id)) return false

  // VitePress has strict entries for its client and default-theme roots. Treat
  // descendant implementation files as package code, not site singletons.
  if (
    id === normalizePath(DIST_CLIENT_PATH) ||
    id.startsWith(`${normalizePath(DIST_CLIENT_PATH)}/`)
  ) {
    return false
  }

  // A `moduleParsed` call proves that a loader produced JavaScript. Accept
  // custom and extensionless files because plugins can provide singleton
  // modules from them.
  return true
}

function isSsrRuntimeBridgeSource(
  id: string,
  moduleInfo: Pick<Rolldown.ModuleInfo, 'meta'>
): boolean {
  return (
    isSsrRuntimeGraphSource(id, moduleInfo) &&
    (id.startsWith('\0') || !id.includes('?'))
  )
}

/** @internal Exported for focused pipeline tests. */
export function createSsrRuntimeBridgePlugin(
  _config: Pick<SiteConfig, 'themeDir'>,
  bridgeModuleIds: Set<string>
): Plugin {
  const emitted = new Set<string>()
  const reachableFromTheme = new Set<string>()
  const parsedModules = new Map<string, Rolldown.ModuleInfo>()
  let themeEntryId: string | undefined

  const emitBridge = (
    context: Rolldown.PluginContext,
    moduleInfo: Rolldown.ModuleInfo
  ) => {
    const id = normalizePath(moduleInfo.id)
    if (!isSsrRuntimeBridgeSource(id, moduleInfo)) return

    bridgeModuleIds.add(id)
    if (moduleInfo.isEntry || emitted.has(id)) return
    emitted.add(id)
    context.emitFile({
      type: 'chunk',
      id: moduleInfo.id,
      name: `site-runtime-${createHash('sha256').update(id).digest('hex').slice(0, 16)}`,
      // Create an importable facade for each source identity. Rolldown shares
      // the implementation chunk with app.js and does not evaluate it twice.
      preserveSignature: 'strict'
    })
  }

  const visitThemeGraph = (
    context: Rolldown.PluginContext,
    startingId: string
  ) => {
    const pending = [startingId]
    while (pending.length) {
      const rawId = pending.pop()!
      const id = normalizePath(rawId)
      if (reachableFromTheme.has(id)) continue
      reachableFromTheme.add(id)

      const moduleInfo = parsedModules.get(id)
      if (!moduleInfo) continue
      emitBridge(context, moduleInfo)
      if (id !== themeEntryId && !isSsrRuntimeGraphSource(id, moduleInfo)) {
        continue
      }
      pending.push(
        ...moduleInfo.importedIds,
        ...moduleInfo.dynamicallyImportedIds
      )
    }
  }

  return {
    name: 'vitepress:ssr-runtime-theme-bridges',
    resolveId(id) {
      // A virtual module owner can resolve only its public ID. Rolldown resolves
      // emitted entries from the canonical ID. Preserve it without a second
      // resolution.
      if (id.startsWith('\0') && emitted.has(normalizePath(id))) return id
    },
    async buildStart() {
      // Record the resolved theme entry and its file descendants. This supports
      // custom resolvers that map `@theme/index` to a virtual or external
      // source.
      const resolved = await this.resolve('@theme/index', undefined, {
        isEntry: true
      })
      if (!resolved || resolved.external) {
        this.error(
          'Unable to resolve the custom theme entry for the shared SSR runtime.'
        )
      }
      const id = normalizePath(resolved.id)
      themeEntryId = id
      bridgeModuleIds.add(id)
      visitThemeGraph(this, resolved.id)
    },
    moduleParsed(moduleInfo) {
      const id = normalizePath(moduleInfo.id)
      if (id !== themeEntryId && !isSsrRuntimeGraphSource(id, moduleInfo)) {
        return
      }
      parsedModules.set(id, moduleInfo)

      if (
        reachableFromTheme.has(id) ||
        moduleInfo.importers.some((importer) =>
          reachableFromTheme.has(normalizePath(importer))
        ) ||
        moduleInfo.dynamicImporters.some((importer) =>
          reachableFromTheme.has(normalizePath(importer))
        )
      ) {
        // Rolldown can parse a module before it finds the custom-theme importer.
        // Walk the known forward graph so traversal order cannot change the
        // result.
        reachableFromTheme.delete(id)
        visitThemeGraph(this, moduleInfo.id)
      }
    }
  }
}

/** @internal Exported for focused pipeline tests. */
export function collectSsrRuntimeBridges(
  result: Rolldown.RolldownOutput,
  outDir: string,
  bridgeModuleIds: ReadonlySet<string>
): SsrRuntimeBridgeMap {
  const bridges = Object.create(null) as SsrRuntimeBridgeMap
  for (const output of result.output) {
    if (output.type !== 'chunk' || !output.isEntry || !output.facadeModuleId) {
      continue
    }
    const moduleId = normalizePath(output.facadeModuleId)
    if (!bridgeModuleIds.has(moduleId)) continue
    bridges[moduleId] = path.resolve(outDir, output.fileName)
  }

  const missing = [...bridgeModuleIds]
    .filter((moduleId) => bridges[moduleId] === undefined)
    .sort()
  if (missing.length) {
    throw new Error(
      `The shared SSR runtime did not emit an entry facade for:\n${missing.map((id) => `  ${id}`).join('\n')}\nPage modules cannot safely reuse this runtime without those bridges.`
    )
  }
  return bridges
}

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

export type BundleTarget =
  | {
      mode: 'full'
      vitePressPluginOptions?: VitePressPluginOptions
    }
  | {
      mode: 'client'
      vitePressPluginOptions?: VitePressPluginOptions
    }
  | {
      mode: 'ssr-runtime'
      outDir: string
      clientAssetMap: ClientAssetMap
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
        ? [createSsrRuntimeBridgePlugin(config, ssrRuntimeBridgeModuleIds)]
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
export async function bundle(
  config: SiteConfig,
  options: BuildOptions,
  pageMetaMap?: Record<string, PageMeta>,
  target: BundleTarget = { mode: 'full' }
): Promise<{
  clientResult: Rolldown.RolldownOutput | null
  serverResult: Rolldown.RolldownOutput | null
  pageToHashMap: Record<string, string>
  clientAssetMap: ClientAssetMap
  ssrRuntimeBridgeMap: SsrRuntimeBridgeMap
}> {
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
        vitePressPluginOptions:
          target.mode === 'client' || target.mode === 'full'
            ? target.vitePressPluginOptions
            : undefined
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
