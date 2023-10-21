import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  build,
  normalizePath,
  type BuildOptions,
  type Rollup,
  type InlineConfig as ViteInlineConfig
} from 'vite'
import { APP_PATH } from '../alias'
import type { SiteConfig } from '../config'
import { createVitePressPlugin } from '../plugin'
import { sanitizeFileName, slash } from '../shared'
import { task } from '../utils/task'
import { buildMPAClient } from './buildMPAClient'

// A list of default theme components that should only be loaded on demand.
const lazyDefaultThemeComponentsRE =
  /VP(HomeSponsors|DocAsideSponsors|TeamPage|TeamMembers|LocalSearchBox|AlgoliaSearchBox|CarbonAds|DocAsideCarbonAds|Sponsors)/

const clientDir = normalizePath(
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../client')
)

// bundles the VitePress app for both client AND server.
export async function bundle(
  config: SiteConfig,
  options: BuildOptions
): Promise<{
  clientResult: Rollup.RollupOutput | null
  serverResult: Rollup.RollupOutput
  pageToHashMap: Record<string, string>
}> {
  const pageToHashMap = Object.create(null)
  const clientJSMap = Object.create(null)

  // define custom rollup input
  // this is a multi-entry build - every page is considered an entry chunk
  // the loading is done via filename conversion rules so that the
  // metadata doesn't need to be included in the main chunk.
  const input: Record<string, string> = {}
  config.pages.forEach((file) => {
    // page filename conversion
    // foo/bar.md -> foo_bar.md
    const alias = config.rewrites.map[file] || file
    input[slash(alias).replace(/\//g, '_')] = path.resolve(config.srcDir, file)
  })

  // resolve options to pass to vite
  const { rollupOptions } = options

  const resolveViteConfig = async (
    ssr: boolean
  ): Promise<ViteInlineConfig> => ({
    root: config.srcDir,
    cacheDir: config.cacheDir,
    base: config.site.base,
    logLevel: config.vite?.logLevel ?? 'warn',
    plugins: await createVitePressPlugin(
      config,
      ssr,
      pageToHashMap,
      clientJSMap
    ),
    ssr: {
      noExternal: ['vitepress', '@docsearch/css']
    },
    build: {
      ...options,
      emptyOutDir: true,
      ssr,
      ssrEmitAssets: config.mpa,
      // minify with esbuild in MPA mode (for CSS)
      minify: ssr
        ? config.mpa
          ? 'esbuild'
          : false
        : typeof options.minify === 'boolean'
        ? options.minify
        : !process.env.DEBUG,
      outDir: ssr ? config.tempDir : config.outDir,
      cssCodeSplit: false,
      rollupOptions: {
        ...rollupOptions,
        input: {
          ...input,
          // use different entry based on ssr or not
          app: path.resolve(APP_PATH, ssr ? 'ssr.js' : 'index.js')
        },
        // important so that each page chunk and the index export things for each
        // other
        preserveEntrySignatures: 'allow-extension',
        output: {
          sanitizeFileName,
          ...rollupOptions?.output,
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
                    ? `${config.assetsDir}/chunks/ui-custom.[hash].js`
                    : `${config.assetsDir}/chunks/[name].[hash].js`
                },
                manualChunks(id, ctx) {
                  if (lazyDefaultThemeComponentsRE.test(id)) {
                    return
                  }
                  if (id.startsWith(`${clientDir}/theme-default`)) {
                    return 'theme'
                  }
                  // move known framework code into a stable chunk so that
                  // custom theme changes do not invalidate hash for all pages
                  if (id.startsWith('\0vite')) {
                    return 'framework'
                  }
                  if (id.includes('plugin-vue:export-helper')) {
                    return 'framework'
                  }
                  if (
                    id.includes(`${clientDir}/app`) &&
                    id !== `${clientDir}/app/index.js`
                  ) {
                    return 'framework'
                  }
                  if (
                    isEagerChunk(id, ctx.getModuleInfo) &&
                    /@vue\/(runtime|shared|reactivity)/.test(id)
                  ) {
                    return 'framework'
                  }
                }
              })
        }
      }
    },
    configFile: config.vite?.configFile
  })

  let clientResult!: Rollup.RollupOutput | null
  let serverResult!: Rollup.RollupOutput

  await task('building client + server bundles', async () => {
    clientResult = config.mpa
      ? null
      : ((await build(await resolveViteConfig(false))) as Rollup.RollupOutput)
    serverResult = (await build(
      await resolveViteConfig(true)
    )) as Rollup.RollupOutput
  })

  if (config.mpa) {
    // in MPA mode, we need to copy over the non-js asset files from the
    // server build since there is no client-side build.
    await Promise.all(
      serverResult.output.map(async (chunk) => {
        if (!chunk.fileName.endsWith('.js')) {
          const tempPath = path.resolve(config.tempDir, chunk.fileName)
          const outPath = path.resolve(config.outDir, chunk.fileName)
          await fs.copy(tempPath, outPath)
        }
      })
    )
    // also copy over public dir
    const publicDir = path.resolve(config.srcDir, 'public')
    if (fs.existsSync(publicDir)) {
      await fs.copy(publicDir, config.outDir)
    }
    // build <script client> bundle
    if (Object.keys(clientJSMap).length) {
      clientResult = await buildMPAClient(clientJSMap, config)
    }
  }

  return { clientResult, serverResult, pageToHashMap }
}

const cache = new Map<string, boolean>()

/**
 * Check if a module is statically imported by at least one entry.
 */
function isEagerChunk(id: string, getModuleInfo: Rollup.GetModuleInfo) {
  if (
    id.includes('node_modules') &&
    !/\.css($|\\?)/.test(id) &&
    staticImportedByEntry(id, getModuleInfo, cache)
  ) {
    return true
  }
}

function staticImportedByEntry(
  id: string,
  getModuleInfo: Rollup.GetModuleInfo,
  cache: Map<string, boolean>,
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

  if (mod.isEntry) {
    cache.set(id, true)
    return true
  }
  const someImporterIs = mod.importers.some((importer: string) =>
    staticImportedByEntry(
      importer,
      getModuleInfo,
      cache,
      importStack.concat(id)
    )
  )
  cache.set(id, someImporterIs)
  return someImporterIs
}
