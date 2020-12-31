import path from 'path'
import { Plugin } from 'vite'
import { SiteConfig, resolveSiteData } from './config'
import { createMarkdownToVueRenderFn } from './markdownToVue'
import { APP_PATH, DEFAULT_THEME_PATH, SITE_DATA_REQUEST_PATH } from './alias'
import createVuePlugin from '@vitejs/plugin-vue'
import slash from 'slash'
import { OutputAsset, OutputChunk } from 'rollup'

const hashRE = /\.(\w+)\.js$/
const staticInjectMarkerRE = /\b(const _hoisted_\d+ = \/\*#__PURE__\*\/createStaticVNode)\("(.*)", (\d+)\)/g
const staticStripRE = /__VP_STATIC_START__.*?__VP_STATIC_END__/g
const staticRestoreRE = /__VP_STATIC_(START|END)__/g

const isPageChunk = (
  chunk: OutputAsset | OutputChunk
): chunk is OutputChunk & { facadeModuleId: string } =>
  !!(
    chunk.type === 'chunk' &&
    chunk.isEntry &&
    chunk.facadeModuleId &&
    chunk.facadeModuleId.endsWith('.md')
  )

export function createVitePressPlugin(
  root: string,
  { configPath, aliases, markdown, themeDir, site }: SiteConfig,
  ssr = false,
  pageToHashMap?: Record<string, string>
): Plugin[] {
  const markdownToVue = createMarkdownToVueRenderFn(root, markdown)

  const vuePlugin = createVuePlugin({
    include: [/\.vue$/, /\.md$/],
    ssr
  })

  let siteData = site

  const isUsingDefaultTheme = themeDir === DEFAULT_THEME_PATH

  const vitePressPlugin: Plugin = {
    name: 'vitepress',

    config() {
      return {
        alias: aliases,
        transformInclude: /\.md$/,
        define: isUsingDefaultTheme
          ? {
              __CARBON__: !!site.themeConfig.carbonAds?.carbon,
              __BSA__: !!site.themeConfig.carbonAds?.custom,
              __ALGOLIA__: !!site.themeConfig.algolia
            }
          : {}
      }
    },

    resolveId(id) {
      if (id === SITE_DATA_REQUEST_PATH) {
        return SITE_DATA_REQUEST_PATH
      }
    },

    load(id) {
      if (id === SITE_DATA_REQUEST_PATH) {
        return `export default ${JSON.stringify(JSON.stringify(siteData))}`
      }
    },

    transform(code, id) {
      if (id.endsWith('.md')) {
        // transform .md files into vueSrc so plugin-vue can handle it
        return markdownToVue(code, id).vueSrc
      }
    },

    configureServer(server) {
      // serve our index.html after vite history fallback
      return () => {
        // @ts-ignore
        server.app.use((req, res, next) => {
          if (req.url!.endsWith('.html')) {
            res.statusCode = 200
            res.end(
              `<div id="app"></div>\n` +
                `<script type="module" src="/@fs/${APP_PATH}/index.js"></script>`
            )
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
      } else {
        // client build:
        // for each .md entry chunk, adjust its name to its correct path.
        for (const name in bundle) {
          const chunk = bundle[name]
          if (isPageChunk(chunk)) {
            // record page -> hash relations
            const hash = chunk.fileName.match(hashRE)![1]
            pageToHashMap![chunk.name] = hash

            // inject another chunk with the content stripped
            bundle[name + '-lean'] = {
              ...chunk,
              fileName: chunk.fileName.replace(/\.js$/, '.lean.js'),
              code: chunk.code.replace(staticStripRE, ``)
            }
            // remove static markers from original code
            chunk.code = chunk.code.replace(staticRestoreRE, '')
          }
        }
      }
    },

    async handleHotUpdate(file, mods, read, server) {
      // handle config hmr
      if (file === configPath) {
        const newData = await resolveSiteData(root)
        if (newData.base !== siteData.base) {
          console.warn(
            `[vitepress]: config.base has changed. Please restart the dev server.`
          )
        }
        siteData = newData
        return [server.moduleGraph.getModuleById(SITE_DATA_REQUEST_PATH)!]
      }

      // hot reload .md files as .vue files
      if (file.endsWith('.md')) {
        const content = await read()
        const { pageData, vueSrc } = markdownToVue(content, file)

        // notify the client to update page data
        server.ws.send({
          type: 'custom',
          event: 'vitepress:pageData',
          data: {
            path: `/${slash(path.relative(root, file))}`,
            pageData
          }
        })

        // reload the content component
        return vuePlugin.handleHotUpdate!(file, mods, () => vueSrc, server)
      }
    }
  }

  return [vitePressPlugin, vuePlugin]
}
