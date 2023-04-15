import path from 'path'
import c from 'picocolors'
import { slash } from './utils/slash'
import type { OutputAsset, OutputChunk } from 'rollup'
import {
  mergeConfig,
  searchForWorkspaceRoot,
  type Plugin,
  type ResolvedConfig,
  type UserConfig
} from 'vite'
import {
  APP_PATH,
  DIST_CLIENT_PATH,
  SITE_DATA_REQUEST_PATH,
  resolveAliases
} from './alias'
import { resolveUserConfig, resolvePages, type SiteConfig } from './config'
import { clearCache, createMarkdownToVueRenderFn } from './markdownToVue'
import type { PageDataPayload } from './shared'
import { staticDataPlugin } from './plugins/staticDataPlugin'
import { webFontsPlugin } from './plugins/webFontsPlugin'
import { dynamicRoutesPlugin } from './plugins/dynamicRoutesPlugin'
import { rewritesPlugin } from './plugins/rewritesPlugin'
import { localSearchPlugin } from './plugins/localSearchPlugin'
import { serializeFunctions, deserializeFunctions } from './utils/fnSerialize'

declare module 'vite' {
  interface UserConfig {
    vitepress?: SiteConfig
  }
}

const hashRE = /\.(\w+)\.js$/
const staticInjectMarkerRE =
  /\b(const _hoisted_\d+ = \/\*(?:#|@)__PURE__\*\/\s*createStaticVNode)\("(.*)", (\d+)\)/g
const staticStripRE = /['"`]__VP_STATIC_START__[^]*?__VP_STATIC_END__['"`]/g
const staticRestoreRE = /__VP_STATIC_(START|END)__/g

// matches client-side js blocks in MPA mode.
// in the future we may add different execution strategies like visible or
// media queries.
const scriptClientRE = /<script\b[^>]*client\b[^>]*>([^]*?)<\/script>/

const isPageChunk = (
  chunk: OutputAsset | OutputChunk
): chunk is OutputChunk & { facadeModuleId: string } =>
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
    pages,
    lastUpdated,
    cleanUrls
  } = siteConfig

  let markdownToVue: Awaited<ReturnType<typeof createMarkdownToVueRenderFn>>

  // lazy require plugin-vue to respect NODE_ENV in @vue/compiler-x
  const vuePlugin = await import('@vitejs/plugin-vue').then((r) =>
    r.default({
      include: [/\.vue$/, /\.md$/],
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
  let hasDeadLinks = false
  let config: ResolvedConfig

  const vitePressPlugin: Plugin = {
    name: 'vitepress',

    async configResolved(resolvedConfig) {
      config = resolvedConfig
      markdownToVue = await createMarkdownToVueRenderFn(
        srcDir,
        markdown,
        pages,
        config.define,
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
          __CARBON__: !!site.themeConfig?.carbonAds
        },
        optimizeDeps: {
          // force include vue to avoid duplicated copies when linked + optimized
          include: ['vue'],
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
        return `${deserializeFunctions.toString()}
        export default deserializeFunctions(JSON.parse(${JSON.stringify(
          JSON.stringify(data)
        )}))`
      }
    },

    async transform(code, id) {
      if (id.endsWith('.vue')) {
        return processClientJS(code, id)
      } else if (id.endsWith('.md')) {
        // transform .md files into vueSrc so plugin-vue can handle it
        const { vueSrc, deadLinks, includes } = await markdownToVue(
          code,
          id,
          config.publicDir
        )
        if (deadLinks.length) {
          hasDeadLinks = true
        }
        if (includes.length) {
          includes.forEach((i) => {
            this.addWatchFile(i)
          })
        }
        return processClientJS(vueSrc, id)
      }
    },

    renderStart() {
      if (hasDeadLinks) {
        throw new Error(`One or more pages contain dead links.`)
      }
    },

    configureServer(server) {
      if (configPath) {
        server.watcher.add(configPath)
        configDeps.forEach((file) => server.watcher.add(file))
      }

      // update pages, dynamicRoutes and rewrites on md file add / deletion
      const onFileAddDelete = async (file: string) => {
        if (file.endsWith('.md')) {
          Object.assign(
            siteConfig,
            await resolvePages(siteConfig.srcDir, siteConfig.userConfig)
          )
        }
      }
      server.watcher.on('add', onFileAddDelete).on('unlink', onFileAddDelete)

      // serve our index.html after vite history fallback
      return () => {
        server.middlewares.use(async (req, res, next) => {
          const url = req.url && cleanUrl(req.url)
          if (url?.endsWith('.html')) {
            res.statusCode = 200
            res.setHeader('Content-Type', 'text/html')
            let html = `<!DOCTYPE html>
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
      if (!ssr && isPageChunk(chunk as OutputChunk)) {
        // For each page chunk, inject marker for start/end of static strings.
        // we do this here because in generateBundle the chunks would have been
        // minified and we won't be able to safely locate the strings.
        // Using a regexp relies on specific output from Vue compiler core,
        // which is a reasonable trade-off considering the massive perf win over
        // a full AST parse.
        code = code.replace(
          staticInjectMarkerRE,
          '$1("__VP_STATIC_START__$2__VP_STATIC_END__", $3)'
        )
        return code
      }
      return null
    },

    generateBundle(_options, bundle) {
      if (ssr) {
        // ssr build:
        // delete all asset chunks
        for (const name in bundle) {
          if (bundle[name].type === 'asset') {
            delete bundle[name]
          }
        }

        if (config.ssr?.format === 'esm') {
          this.emitFile({
            type: 'asset',
            fileName: 'package.json',
            source: '{ "private": true, "type": "module" }'
          })
        }
      } else {
        // client build:
        // for each .md entry chunk, adjust its name to its correct path.
        for (const name in bundle) {
          const chunk = bundle[name]
          if (isPageChunk(chunk)) {
            // record page -> hash relations
            const hash = chunk.fileName.match(hashRE)![1]
            pageToHashMap![chunk.name.toLowerCase()] = hash

            // inject another chunk with the content stripped
            bundle[name + '-lean'] = {
              ...chunk,
              fileName: chunk.fileName.replace(/\.js$/, '.lean.js'),
              code: chunk.code.replace(staticStripRE, `""`)
            }

            // remove static markers from original code
            chunk.code = chunk.code.replace(staticRestoreRE, '')
          }
        }
      }
    },

    async handleHotUpdate(ctx) {
      const { file, read, server } = ctx
      if (file === configPath || configDeps.includes(file)) {
        siteConfig.logger.info(
          c.green(
            `${path.relative(
              process.cwd(),
              file
            )} changed, restarting server...\n`
          ),
          { clear: true, timestamp: true }
        )

        try {
          await resolveUserConfig(siteConfig.root, 'serve', 'development')
        } catch (err: any) {
          return
        }

        clearCache()
        await recreateServer?.()
        return
      }

      // hot reload .md files as .vue files
      if (file.endsWith('.md')) {
        const content = await read()
        const { pageData, vueSrc } = await markdownToVue(
          content,
          file,
          config.publicDir
        )

        const payload: PageDataPayload = {
          path: `/${slash(path.relative(srcDir, file))}`,
          pageData
        }

        // notify the client to update page data
        server.ws.send({
          type: 'custom',
          event: 'vitepress:pageData',
          data: payload
        })

        // overwrite src so vue plugin can handle the HMR
        ctx.read = () => vueSrc
      }
    }
  }

  return [
    vitePressPlugin,
    rewritesPlugin(siteConfig),
    vuePlugin,
    webFontsPlugin(siteConfig.useWebFonts),
    ...(userViteConfig?.plugins || []),
    await localSearchPlugin(siteConfig),
    staticDataPlugin,
    await dynamicRoutesPlugin(siteConfig)
  ]
}
