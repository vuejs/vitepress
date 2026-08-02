import { exactRegex } from '@rolldown/pluginutils'
import path from 'node:path'
import pMap from 'p-map'
import c from 'picocolors'
import {
  mergeConfig,
  normalizePath,
  searchForWorkspaceRoot,
  type EnvironmentModuleNode,
  type Plugin,
  type ResolvedConfig,
  type Rolldown,
  type UserConfig
} from 'vite'
import {
  APP_PATH,
  DEFAULT_THEME_PATH,
  DIST_CLIENT_PATH,
  SITE_DATA_ID,
  SITE_DATA_REQUEST_PATH,
  resolveAliases
} from './alias'
import { isAdditionalConfigFile, resolvePages, type SiteConfig } from './config'
import {
  clearCache,
  createMarkdownToVueRenderFn,
  createStaticPageVueSource,
  resolveDeadLinks,
  type MarkdownCompileResult
} from './markdownToVue'
import type { PageArtifactStore } from './pageArtifacts'
import { dynamicRoutesPlugin } from './plugins/dynamicRoutesPlugin'
import { localSearchPlugin } from './plugins/localSearchPlugin'
import { createVueDescriptorMemoryPlugin } from './plugins/vueDescriptorMemory'
import { rewritesPlugin } from './plugins/rewritesPlugin'
import { staticDataPlugin } from './plugins/staticDataPlugin'
import { webFontsPlugin } from './plugins/webFontsPlugin'
import { slash, type PageDataPayload } from './shared'
import { deserializeFunctions, serializeFunctions } from './utils/fnSerialize'
import { cacheAllGitTimestamps, getGitTimestamp } from './utils/getGitTimestamp'

declare module 'vite' {
  interface UserConfig {
    vitepress?: SiteConfig
  }
}

const themeRE = /(?:^|\/)\.vitepress\/theme\/index\.(m|c)?(j|t)s$/
const startsWithThemeRE = /^@theme(?:\/|$)/
const docsearchRE = /\bdocsearch\b/ // narrow it if any issue arises
const ssrPageArtifactRE = /\.__vitepress_ssr\.vue$/

const hashRE = /\.([-\w]+)\.js$/
const staticInjectMarkerRE = /\bcreateStaticVNode\((?:(".*")|('.*')), (\d+)\)/g
const staticStripRE = /['"`]__VP_STATIC_START__[^]*?__VP_STATIC_END__['"`]/g
const staticRestoreRE = /__VP_STATIC_(START|END)__/g

// matches client-side js blocks in MPA mode.
// in the future we may add different execution strategies like visible or
// media queries.
const scriptClientRE = /<script\b[^>]*client\b[^>]*>([^]*?)<\/script>/

const isPageChunk = <T extends Rolldown.OutputChunk | Rolldown.RenderedChunk>(
  chunk: Rolldown.OutputAsset | T
): chunk is T =>
  !!(
    chunk.type === 'chunk' &&
    chunk.isEntry &&
    chunk.facadeModuleId?.endsWith('.md')
  )

const cleanUrl = (url: string): string => url.replace(/[?#].*$/s, '')

// per-page metadata collected during transform, keyed by relativePath
export interface PageMeta {
  lastUpdated?: number
}

export interface VitePressPluginOptions {
  isSsrBatch?: boolean
  /** Compile/store Markdown only, without running Vue's SFC compiler. */
  artifactOnly?: boolean
  /** Shared Markdown artifacts produced by the build coordinator. */
  pageArtifactStore?: PageArtifactStore
  /**
   * Make the coordinator's client graph own the artifact-seeding pass. Every
   * page is transformed into that graph before virtual consumers such as local
   * search load, and the normal client entries then reuse the same modules.
   */
  coordinatorClient?: boolean
  /**
   * Generated `.vue` module id -> rewritten page artifact. These modules let
   * the isolated SSR compiler consume the coordinator's post-Markdown SFC
   * without re-running source-only Markdown transforms.
   */
  ssrPageArtifacts?: ReadonlyMap<string, string>
  /**
   * Skip the normal git-history prewarm. A coordinator that owns the build can
   * use this after calling `cacheAllGitTimestamps` once for all consumers.
   */
  skipGitScan?: boolean
}

export async function createVitePressPlugin(
  siteConfig: SiteConfig,
  ssr = false,
  pageToHashMap?: Record<string, string>,
  clientJSMap?: Record<string, string>,
  pageMetaMap?: Record<string, PageMeta>,
  restartServer?: () => Promise<void>,
  options: VitePressPluginOptions = {}
) {
  const {
    isSsrBatch = false,
    artifactOnly = false,
    pageArtifactStore,
    coordinatorClient = false,
    ssrPageArtifacts,
    skipGitScan = false
  } = options
  if (artifactOnly && !pageArtifactStore) {
    throw new Error('artifactOnly requires a pageArtifactStore.')
  }
  if (coordinatorClient && (!pageArtifactStore || ssr || artifactOnly)) {
    throw new Error(
      'coordinatorClient requires a non-SSR client build with a pageArtifactStore.'
    )
  }
  if (ssrPageArtifacts && (!pageArtifactStore || !ssr || artifactOnly)) {
    throw new Error(
      'ssrPageArtifacts requires an SSR compiler with a pageArtifactStore.'
    )
  }
  const {
    srcDir,
    configPath,
    configDeps,
    markdown,
    site,
    vue: userVuePluginOptions,
    vite: userViteConfig,
    lastUpdated,
    cleanUrls
  } = siteConfig

  let markdownToVue: Awaited<ReturnType<typeof createMarkdownToVueRenderFn>>

  // lazy require plugin-vue to respect NODE_ENV in @vue/compiler-x
  const vuePlugin = artifactOnly
    ? undefined
    : await import('@vitejs/plugin-vue').then((r) =>
        r.default({
          include: /\.(?:vue|md)$/,
          ...userVuePluginOptions
        })
      )
  const vueDescriptorMemoryPlugin = vuePlugin
    ? createVueDescriptorMemoryPlugin(vuePlugin)
    : undefined

  const processClientJS = (code: string, id: string) => {
    return scriptClientRE.test(code)
      ? code.replace(scriptClientRE, (_, content) => {
          if (ssr && clientJSMap) clientJSMap[id] = content
          return `\n`.repeat(_.split('\n').length - 1)
        })
      : code
  }

  let siteData = site
  let allDeadLinks: MarkdownCompileResult['deadLinks'] = []
  let config: ResolvedConfig
  let importerMap: Record<string, Set<string> | undefined> = {}
  const dynamicRouteSources = new Map(
    siteConfig.dynamicRoutes.map((route) => [
      normalizePath(route.fullPath),
      normalizePath(path.resolve(srcDir, route.route))
    ])
  )

  const vitePressPlugin: Plugin = {
    name: 'vitepress',

    async configResolved(resolvedConfig) {
      config = resolvedConfig
      // The browser build owns the copied public tree. Later isolated SSR
      // environments may resolve different Vite settings, but must not mutate
      // the coordinator's client-resolved path after its cache namespace and
      // asset map have been established.
      if (!isSsrBatch) siteConfig.publicDir = config.publicDir
      // pre-resolve git timestamps
      if (lastUpdated && !isSsrBatch && !skipGitScan) {
        await cacheAllGitTimestamps(
          srcDir,
          ['*.md'],
          config.command === 'build'
        )
      }
      markdownToVue = await createMarkdownToVueRenderFn(
        srcDir,
        markdown ?? {},
        config.base,
        lastUpdated ?? false,
        cleanUrls ?? false,
        siteConfig,
        artifactOnly || coordinatorClient,
        !isSsrBatch,
        !!pageArtifactStore,
        [
          config.plugins,
          config.environments?.client?.plugins,
          config.build?.rolldownOptions?.plugins,
          config.environments?.client?.build.rolldownOptions.plugins
        ],
        config.experimental?.renderBuiltUrl
      )
    },

    config() {
      const baseConfig: UserConfig = {
        resolve: {
          alias: resolveAliases(siteConfig.root, ssr)
        },
        define: {
          __VP_LOCAL_SEARCH__: site.themeConfig?.search?.provider === 'local',
          __ALGOLIA__:
            site.themeConfig?.search?.provider === 'algolia' ||
            !!site.themeConfig?.algolia, // legacy
          __CARBON__: !!site.themeConfig?.carbonAds,
          __ASSETS_DIR__: JSON.stringify(siteConfig.assetsDir),
          __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: !!process.env.DEBUG
        },
        optimizeDeps: {
          // force include vue to avoid duplicated copies when linked + optimized
          include: [
            'vue',
            'vitepress > @vue/devtools-api',
            'vitepress > @vueuse/core'
          ].filter((d) => d != null),
          exclude: ['@docsearch/js', '@docsearch/sidepanel-js', 'vitepress']
        },
        server: {
          fs: {
            allow: [
              DIST_CLIENT_PATH,
              srcDir,
              searchForWorkspaceRoot(process.cwd())
            ]
          }
        },
        vitepress: siteConfig
      }
      return userViteConfig
        ? mergeConfig(baseConfig, userViteConfig)
        : baseConfig
    },

    resolveId: {
      filter: {
        id: [exactRegex(SITE_DATA_ID), startsWithThemeRE, ssrPageArtifactRE]
      },
      handler(id, importer, resolveOptions) {
        if (ssrPageArtifactRE.test(id)) {
          return ssrPageArtifacts?.has(id) ? id : undefined
        }
        if (id === SITE_DATA_ID) {
          return SITE_DATA_REQUEST_PATH
        }
        return this.resolve(
          siteConfig.themeDir + id.slice(6),
          importer,
          Object.assign({ skipSelf: true }, resolveOptions)
        )
      }
    },

    load: {
      filter: {
        id: [exactRegex(SITE_DATA_REQUEST_PATH), ssrPageArtifactRE]
      },
      async handler(id) {
        const artifactPage = ssrPageArtifacts?.get(id)
        if (ssrPageArtifactRE.test(id)) {
          if (!artifactPage) return
          const artifact = await pageArtifactStore!.getCurrent(artifactPage)
          if (!artifact) {
            throw new Error(
              `Missing coordinator Markdown artifact for SSR page ${artifactPage}.`
            )
          }
          return artifact.vueSrc
        }

        let data = siteData
        // head info is not needed by the client in production build
        if (config.command === 'build') {
          data = { ...siteData, head: [] }
          // in production client build, the data is inlined on each page
          // to avoid config changes invalidating every chunk.
          if (!ssr) {
            return `export default window.__VP_SITE_DATA__`
          }
        }
        data = serializeFunctions(data)
        return `${deserializeFunctions};export default deserializeFunctions(JSON.parse(${JSON.stringify(JSON.stringify(data))}))`
      }
    },

    transform: {
      filter: { id: [docsearchRE, /\.vue$/, /\.md$/] },
      async handler(code, id) {
        if (id.endsWith('.vue')) {
          return processClientJS(code, id)
        }
        if (id.endsWith('.md')) {
          // transform .md files into vueSrc so plugin-vue can handle it
          const sourcePath = slash(path.relative(srcDir, id))
          const artifactPage = siteConfig.rewrites.map[sourcePath] || sourcePath
          let artifactInput = code
          if (pageArtifactStore && lastUpdated) {
            const timestampSource =
              dynamicRouteSources.get(normalizePath(id)) || id
            artifactInput += `\0vitepress:last-updated:${await getGitTimestamp(timestampSource)}`
          }
          const artifact = pageArtifactStore
            ? await pageArtifactStore.getOrCreate(
                artifactPage,
                artifactInput,
                pageArtifactStore.readOnly
                  ? undefined
                  : () => markdownToVue(code, id),
                (artifact) => markdownToVue.finalize(artifact, id)
              )
            : await markdownToVue(code, id)
          const {
            vueSrc,
            deadLinks,
            linkCandidates,
            linkContext,
            includes,
            pageData
          } = artifact
          const currentDeadLinks = isSsrBatch
            ? []
            : linkCandidates && linkContext
              ? resolveDeadLinks(linkCandidates, linkContext, siteConfig)
              : deadLinks
          if (pageMetaMap) {
            pageMetaMap[pageData.relativePath] = {
              lastUpdated: pageData.lastUpdated
            }
          }
          allDeadLinks.push(...currentDeadLinks)
          if (includes.length) {
            includes.forEach((i) => {
              ;(importerMap[slash(i)] ??= new Set()).add(slash(id))
              this.addWatchFile(i)
            })
          }
          if (
            this.environment.mode === 'dev' &&
            this.environment.name === 'client'
          ) {
            logDeadLinks(currentDeadLinks, siteConfig.logger, true)
            const payload: PageDataPayload = {
              path: `/${pageData.relativePath}`,
              pageData
            }
            // notify the client to update page data
            this.environment.hot.send({
              type: 'custom',
              event: 'vitepress:pageData',
              data: payload
            })
          }
          // An artifact-only coordinator environment needs Vite to execute all
          // enforce-pre source transforms and this Markdown transform. Keeping
          // Vue out of that pass avoids compiling throwaway client/SSR JS.
          return artifactOnly
            ? 'export default {}'
            : processClientJS(
                artifact.staticPage
                  ? createStaticPageVueSource(artifact)
                  : vueSrc,
                id
              )
        }
        if (docsearchRE.test(normalizePath(id))) {
          return code
            .replaceAll('[data-theme=dark]', '.dark')
            .replaceAll(/\(max-width:\s*768px\)/g, '(max-width: 767px)')
            .replaceAll(/\(min-width:\s*769px\)/g, '(min-width: 768px)')
        }
      }
    },

    renderStart() {
      if (allDeadLinks.length > 0) {
        logDeadLinks(allDeadLinks, siteConfig.logger)
        siteConfig.logger.info(
          c.cyan(
            '\nIf this is expected, you can disable this check via config. Refer: https://vitepress.dev/reference/site-config#ignoredeadlinks\n'
          )
        )
        throw new Error(`${allDeadLinks.length} dead link(s) found.`)
      }
    },

    configureServer(server) {
      if (configPath) {
        server.watcher.add(configPath)
        configDeps.forEach((file) => server.watcher.add(file))
      }

      // serve our index.html after vite history fallback
      return () => {
        server.middlewares.use(async (req, res, next) => {
          const url = req.url && cleanUrl(req.url)
          if (url?.endsWith('.html')) {
            res.statusCode = 200
            res.setHeader('Content-Type', 'text/html')
            let html = `\
<!DOCTYPE html>
<html>
  <head>
    <title></title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="description" content="">
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/@fs/${APP_PATH}/index.js"></script>
  </body>
</html>`
            html = await server.transformIndexHtml(url, html, req.originalUrl)
            res.end(html)
            return
          }
          next()
        })
      }
    },

    renderChunk(code, chunk) {
      if (artifactOnly) return null
      if (!ssr && isPageChunk(chunk)) {
        // For each page chunk, inject marker for start/end of static strings.
        // we do this here because in generateBundle the chunks would have been
        // minified and we won't be able to safely locate the strings.
        // Using a regexp relies on specific output from Vue compiler core,
        // which is a reasonable trade-off considering the massive perf win over
        // a full AST parse.
        code = code.replace(staticInjectMarkerRE, (_, str1, str2, flag) => {
          const str = str1 || str2
          const quote = str[0]
          return `createStaticVNode(${quote}__VP_STATIC_START__${str.slice(1, -1)}__VP_STATIC_END__${quote}, ${flag})`
        })
        return code
      }
      return null
    },

    generateBundle: {
      order: ssr ? null : 'post',
      handler(_options, bundle) {
        if (artifactOnly) return
        if (ssr) {
          this.emitFile({
            type: 'asset',
            fileName: 'package.json',
            source: '{ "private": true, "type": "module" }'
          })
          return
        }

        // client build:
        // for each .md entry chunk, adjust its name to its correct path.
        for (const name in bundle) {
          const chunk = bundle[name]
          if (isPageChunk(chunk)) {
            // record page -> hash relations
            const hash = chunk.fileName.match(hashRE)![1]
            pageToHashMap![chunk.name.toLowerCase()] = hash

            // inject another chunk with the content stripped
            this.emitFile({
              type: 'asset',
              name: name + '-lean',
              fileName: chunk.fileName.replace(/\.js$/, '.lean.js'),
              source: chunk.code.replace(staticStripRE, `""`)
            })

            // remove static markers from original code
            chunk.code = chunk.code.replace(staticRestoreRE, '')
          }
        }
      }
    },

    async closeBundle() {
      await pageArtifactStore?.flush()
    },

    async hotUpdate({ file, type }) {
      if (this.environment.name !== 'client') return
      const relativePath = path.posix.relative(srcDir, file)

      // update pages, dynamicRoutes and rewrites on md file creation / deletion
      if (file.endsWith('.md') && type !== 'update') {
        await resolvePages(siteConfig)
      }

      if (
        file === configPath ||
        configDeps.includes(file) ||
        isAdditionalConfigFile(file)
      ) {
        siteConfig.logger.info(
          c.green(
            `${path.relative(process.cwd(), file)} changed, restarting server...\n`
          ),
          { clear: true, timestamp: true }
        )

        return restartServer?.()
      }

      if (themeRE.test(relativePath) && type !== 'update') {
        siteConfig.themeDir =
          type === 'create' ? path.posix.dirname(file) : DEFAULT_THEME_PATH
        siteConfig.logger.info(c.green('page reload ') + c.dim(relativePath), {
          clear: true,
          timestamp: true
        })
        this.environment.moduleGraph.invalidateAll()
        this.environment.hot.send({ type: 'full-reload' })
        return []
      }
    }
  }

  // This must be the final user-visible buildStart hook. Loading modules from
  // an earlier hook would run user transforms before a later user buildStart
  // had initialized their state, unlike Rollup's normal module-load ordering.
  const coordinatorPreloadPlugin: Plugin | undefined = coordinatorClient
    ? {
        name: 'vitepress:coordinator-page-preload',
        enforce: 'post',
        buildStart: {
          order: 'post',
          sequential: true,
          async handler() {
            const concurrency = Math.max(
              1,
              Math.min(siteConfig.buildConcurrency, siteConfig.pages.length)
            )
            await pMap(
              siteConfig.pages,
              async (page) => {
                const pageId = normalizePath(path.resolve(srcDir, page))
                const resolved = await this.resolve(pageId, undefined, {
                  isEntry: true
                })
                if (!resolved || resolved.external) {
                  throw new Error(
                    `Unable to preload VitePress page entry ${page}.`
                  )
                }
                try {
                  await this.load({
                    id: resolved.id,
                    // Wait for plugin-vue's template/script/style submodules.
                    // The declared entry will reuse this same transformed graph,
                    // so its heavyweight SFC descriptor can then be compacted
                    // while later pages are still streaming through the build.
                    resolveDependencies: true
                  })
                } finally {
                  vueDescriptorMemoryPlugin?.api.release([pageId])
                }
              },
              { concurrency }
            )
          }
        }
      }
    : undefined

  const hmrFix: Plugin = {
    name: 'vitepress:hmr-fix',
    async hotUpdate({ file, type, modules: existingMods }) {
      if (this.environment.name !== 'client') return
      const modules: EnvironmentModuleNode[] = []
      const fileId = slash(file)

      if (file.endsWith('.md')) {
        const mod = this.environment.moduleGraph.getModuleById(file)
        mod && modules.push(mod)
      }

      importerMap[fileId]?.forEach((importerId) => {
        const relativePath = slash(path.relative(srcDir, importerId))
        // the compile cache is keyed by the rewritten path
        clearCache(siteConfig.rewrites.map[relativePath] || relativePath)
        const mod = this.environment.moduleGraph.getModuleById(importerId)
        mod && modules.push(mod)
      })

      if (type === 'delete') {
        // a deleted include: its importers were just invalidated above
        delete importerMap[fileId]
        // a deleted page: prune it from every importer set
        for (const importers of Object.values(importerMap)) {
          importers?.delete(fileId)
        }
      }

      return modules.length ? [...existingMods, ...modules] : undefined
    }
  }

  if (artifactOnly) {
    return [
      vitePressPlugin,
      // User enforce-pre transforms are part of the Markdown artifact input.
      ...(userViteConfig?.plugins || []),
      await dynamicRoutesPlugin(siteConfig)
    ]
  }

  return [
    vitePressPlugin,
    rewritesPlugin(siteConfig),
    ...(vuePlugin ? [vuePlugin] : []),
    hmrFix,
    webFontsPlugin(siteConfig.useWebFonts),
    ...(userViteConfig?.plugins || []),
    await localSearchPlugin(siteConfig, isSsrBatch, pageArtifactStore),
    staticDataPlugin,
    await dynamicRoutesPlugin(siteConfig),
    ...(vueDescriptorMemoryPlugin ? [vueDescriptorMemoryPlugin] : []),
    ...(coordinatorPreloadPlugin ? [coordinatorPreloadPlugin] : [])
  ]
}

function logDeadLinks(
  deadLinks: MarkdownCompileResult['deadLinks'],
  logger: SiteConfig['logger'],
  devMode = false
) {
  const logged = new Set<string>()
  deadLinks.forEach(({ url, file, line }, i) => {
    const location = line == null ? file : `${file}:${line}`
    const key = `${location}:::${url}`
    if (logged.has(key)) return
    logged.add(key)
    const prefix = '\n'.repeat(i === 0 ? (devMode ? 1 : 2) : 0)
    logger.warn(
      c.yellow(
        `${prefix}(!) Found dead link ${c.cyan(url)} in file ${c.white(c.dim(location))}`
      )
    )
  })
}
