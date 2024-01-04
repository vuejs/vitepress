import path from 'path'
import { fileURLToPath } from 'url'
import {
  normalizePath,
  type BuildOptions,
  type Rollup,
  type InlineConfig as ViteInlineConfig
} from 'vite'
import { APP_PATH } from '../alias'
import type { SiteConfig } from '../config'
import { slash } from '../shared'
import { createVitePressPlugin } from '../plugin'
import { escapeRegExp, sanitizeFileName } from '../shared'

// https://github.com/vitejs/vite/blob/d2aa0969ee316000d3b957d7e879f001e85e369e/packages/vite/src/node/plugins/splitVendorChunk.ts#L14
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
  'node_modules/vue-demi/',
  clientDir
]

const themeEntryRE = (themeDir: string) =>
  new RegExp(
    `^${escapeRegExp(
      path.resolve(themeDir, 'index.js').replace(/\\/g, '/')
    ).slice(0, -2)}m?(j|t)s`
  )

const cache = new Map<string, boolean>()
const cacheTheme = new Map<string, boolean>()

/**
 * Check if a module is statically imported by at least one entry.
 */
function isEagerChunk(id: string, getModuleInfo: Rollup.GetModuleInfo) {
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
  getModuleInfo: Rollup.GetModuleInfo,
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

// define custom rollup input
// this is a multi-entry build - every page is considered an entry chunk
// the loading is done via filename conversion rules so that the
// metadata doesn't need to be included in the main chunk.
const resolveInput = (config: SiteConfig) =>
  Object.fromEntries(
    config.pages.map((file) => {
      // page filename conversion
      // foo/bar.md -> foo_bar.md
      const alias = config.rewrites.map[file] || file
      return [
        slash(alias).replace(/\//g, '_'),
        path.resolve(config.srcDir, file)
      ]
    })
  ) as Record<string, string>

export default async function resolveViteConfig(
  ssr: boolean,
  {
    config,
    options,
    pageToHashMap,
    clientJSMap
  }: {
    config: SiteConfig
    options: BuildOptions
    pageToHashMap: Record<string, string>
    clientJSMap: Record<string, string>
  }
): Promise<ViteInlineConfig> {
  return {
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
        ...options.rollupOptions,
        input: {
          ...resolveInput(config),
          // use different entry based on ssr or not
          app: path.resolve(APP_PATH, ssr ? 'ssr.js' : 'index.js')
        },
        // important so that each page chunk and the index export things for each
        // other
        preserveEntrySignatures: 'allow-extension',
        output: {
          sanitizeFileName,
          ...options.rollupOptions?.output,
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

                  if (
                    (id.startsWith(`${clientDir}/theme-default`) ||
                      !excludedModules.some((i) => id.includes(i))) &&
                    staticImportedByEntry(
                      id,
                      ctx.getModuleInfo,
                      cacheTheme,
                      themeEntryRE(config.themeDir)
                    )
                  ) {
                    return 'theme'
                  }
                }
              })
        }
      }
    },
    configFile: config.vite?.configFile
  }
}
