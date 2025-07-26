import path from 'node:path'
import c from 'picocolors'
import {
  mergeConfig,
  normalizePath,
  searchForWorkspaceRoot,
  type Plugin,
  type ResolvedConfig,
  type Rollup,
  type UserConfig
} from 'vite'
import {
  APP_PATH,
  DEFAULT_THEME_PATH,
  DIST_CLIENT_PATH,
  SITE_DATA_REQUEST_PATH,
  resolveAliases
} from './alias'
import {
  isAdditionalConfigFile,
  resolvePages,
  resolveUserConfig,
  type SiteConfig
} from './config'
import { disposeMdItInstance } from './markdown/markdown'
import {
  clearCache,
  createMarkdownToVueRenderFn,
  type MarkdownCompileResult
} from './markdownToVue'
import { dynamicRoutesPlugin } from './plugins/dynamicRoutesPlugin'
import { localSearchPlugin } from './plugins/localSearchPlugin'
import { rewritesPlugin } from './plugins/rewritesPlugin'
import { staticDataPlugin } from './plugins/staticDataPlugin'
import { webFontsPlugin } from './plugins/webFontsPlugin'
import { slash, type PageDataPayload } from './shared'
import { deserializeFunctions, serializeFunctions } from './utils/fnSerialize'

declare module 'vite' {
  interface UserConfig {
    vitepress?: SiteConfig
  }
}

const themeRE = /\/\.vitepress\/theme\/index\.(m|c)?(j|t)s$/
const docsearchRE = /\/@docsearch\/css\/dist\/style.css(?:$|\?)/

const hashRE = /\.([-\w]+)\.js$/
const staticInjectMarkerRE = /\bcreateStaticVNode\((?:(".*")|('.*')), (\d+)\)/g
const staticStripRE = /['"`]__VP_STATIC_START__[^]*?__VP_STATIC_END__['"`]/g
const staticRestoreRE = /__VP_STATIC_(START|END)__/g

// matches client-side js blocks in MPA mode.
// in the future we may add different execution strategies like visible or
// media queries.
const scriptClientRE = /<script\b[^>]*client\b[^>]*>([^]*?)<\/script>/

const isPageChunk = (
  chunk: Rollup.OutputAsset | Rollup.OutputChunk
): chunk is Rollup.OutputChunk & { facadeModuleId: string } =>
  !!(
    chunk.type === 'chunk' &&
    chunk.isEntry &&
    chunk.facadeModuleId &&
    chunk.facadeModuleId.endsWith('.md')
  )

const cleanUrl = (url: string): string =>
  url.replace(/#.*$/s, '').replace(/\?.*$/s, '')

export async function createVitePressPlugin(
  siteConfig: SiteConfig,
  ssr = false,
  pageToHashMap?: Record<string, string>,
  clientJSMap?: Record<string, string>,
  recreateServer?: () => Promise<void>
) {
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
  const vuePlugin = await import('@vitejs/plugin-vue').then((r) =>
    r.default({
      include: /\.(?:vue|md)$/,
      ...userVuePluginOptions
    })
  )

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

  const vitePressPlugin: Plugin = {
    name: 'vitepress',

    async configResolved(resolvedConfig) {
      config = resolvedConfig
      markdownToVue = await createMarkdownToVueRenderFn(
        srcDir,
        markdown,
        config.command === 'build',
        config.base,
        lastUpdated,
        cleanUrls,
        siteConfig
      )
    },

    config() {
      const baseConfig: UserConfig = {
        resolve: {
          alias: resolveAliases(siteConfig, ssr)
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
            'vitepress > @vueuse/core',
            siteConfig.themeDir === DEFAULT_THEME_PATH
              ? '@theme/index'
              : undefined
          ].filter((d) => d != null),
          exclude: ['@docsearch/js', 'vitepress']
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

    resolveId(id) {
      if (id === SITE_DATA_REQUEST_PATH) {
        return SITE_DATA_REQUEST_PATH
      }
    },

    load(id) {
      if (id === SITE_DATA_REQUEST_PATH) {
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

    async transform(code, id) {
      if (docsearchRE.test(normalizePath(id))) {
        return code.replaceAll('[data-theme=dark]', '.dark')
      }
      if (id.endsWith('.vue')) {
        return processClientJS(code, id)
      }
      if (id.endsWith('.md')) {
        // transform .md files into vueSrc so plugin-vue can handle it
        const { vueSrc, deadLinks, includes, pageData } = await markdownToVue(
          code,
          id,
          config.publicDir
        )
        allDeadLinks.push(...deadLinks)
        if (includes.length) {
          includes.forEach((i) => {
            ;(importerMap[slash(i)] ??= new Set()).add(id)
            this.addWatchFile(i)
          })
        }
        if (
          this.environment.mode === 'dev' &&
          this.environment.name === 'client'
        ) {
          const relativePath = path.posix.relative(srcDir, id)
          const payload: PageDataPayload = {
            path: `/${siteConfig.rewrites.map[relativePath] || relativePath}`,
            pageData
          }
          // notify the client to update page data
          this.environment.hot.send({
            type: 'custom',
            event: 'vitepress:pageData',
            data: payload
          })
        }
        return processClientJS(vueSrc, id)
      }
    },

    renderStart() {
      if (allDeadLinks.length > 0) {
        allDeadLinks.forEach(({ url, file }, i) => {
          siteConfig.logger.warn(
            c.yellow(
              `${i === 0 ? '\n\n' : ''}(!) Found dead link ${c.cyan(
                url
              )} in file ${c.white(c.dim(file))}`
            )
          )
        })
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

      const onFileAddDelete = async (added: boolean, _file: string) => {
        const file = slash(_file)
        // restart server on theme file creation / deletion
        if (themeRE.test(file)) {
          siteConfig.logger.info(
            c.green(
              `${path.relative(process.cwd(), _file)} ${added ? 'created' : 'deleted'}, restarting server...\n`
            ),
            { clear: true, timestamp: true }
          )

          await recreateServer?.()
        }

        // update pages, dynamicRoutes and rewrites on md file creation / deletion
        if (file.endsWith('.md')) {
          Object.assign(
            siteConfig,
            await resolvePages(
              siteConfig.srcDir,
              siteConfig.userConfig,
              siteConfig.logger
            )
          )
        }

        if (!added && importerMap[file]) {
          delete importerMap[file]
        }
      }
      server.watcher
        .on('add', onFileAddDelete.bind(null, true))
        .on('unlink', onFileAddDelete.bind(null, false))

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
      if (!ssr && isPageChunk(chunk as Rollup.OutputChunk)) {
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

    async hotUpdate({ file }) {
      if (this.environment.name !== 'client') return

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

        try {
          await resolveUserConfig(siteConfig.root, 'serve', 'development')
        } catch (err: any) {
          siteConfig.logger.error(err)
          return
        }

        disposeMdItInstance()
        clearCache()
        await recreateServer?.()
        return
      }
    }
  }

  const hmrFix: Plugin = {
    name: 'vitepress:hmr-fix',
    async hotUpdate({ file, modules }) {
      if (this.environment.name !== 'client') return

      const importers = [...(importerMap[slash(file)] || [])]
      if (importers.length > 0) {
        return [
          ...modules,
          ...importers.map((id) => {
            clearCache(id)
            return this.environment.moduleGraph.getModuleById(id)
          })
        ].filter((mod) => mod !== undefined)
      }
    }
  }

  return [
    vitePressPlugin,
    rewritesPlugin(siteConfig),
    vuePlugin,
    hmrFix,
    webFontsPlugin(siteConfig.useWebFonts),
    ...(userViteConfig?.plugins || []),
    await localSearchPlugin(siteConfig),
    staticDataPlugin,
    await dynamicRoutesPlugin(siteConfig)
  ]
}
