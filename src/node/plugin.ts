import path from 'path'
import { Plugin } from 'vite'
import { SiteConfig, resolveSiteData } from './config'
import { createMarkdownToVueRenderFn } from './markdownToVue'
import { APP_PATH, SITE_DATA_REQUEST_PATH } from './resolver'
import createVuePlugin from '@vitejs/plugin-vue'
import slash from 'slash'

export function createVitePressPlugin(
  root: string,
  { configPath, aliases, markdown, site: initialSiteData }: SiteConfig
): Plugin[] {
  const markdownToVue = createMarkdownToVueRenderFn(root, markdown)

  const vuePlugin = createVuePlugin({
    include: [/\.vue$/, /\.md$/]
  })

  let siteData = initialSiteData
  let stringifiedData = JSON.stringify(JSON.stringify(initialSiteData))

  const vitePressPlugin: Plugin = {
    name: 'vitepress',

    config() {
      return {
        alias: aliases,
        transformInclude: /\.md$/
      }
    },

    resolveId(id) {
      if (id === SITE_DATA_REQUEST_PATH) {
        return SITE_DATA_REQUEST_PATH
      }
    },

    load(id) {
      if (id === SITE_DATA_REQUEST_PATH) {
        return `export default ${stringifiedData}`
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
      const indexPath = `/@fs/${path.join(APP_PATH, 'index.html')}`
      return () => {
        server.app.use((req, _, next) => {
          if (req.url!.endsWith('.html')) {
            req.url = indexPath
          }
          next()
        })
      }
    },

    async handleHotUpdate(file, mods, read, server) {
      if (file === configPath) {
        const newData = await resolveSiteData(root)
        stringifiedData = JSON.stringify(JSON.stringify(newData))
        if (newData.base !== siteData.base) {
          console.warn(
            `[vitepress]: config.base has changed. Please restart the dev server.`
          )
        }
        siteData = newData
        return
      }

      // hot reload .md files as .vue files
      if (file.endsWith('.md')) {
        const content = await read()
        const { pageData, vueSrc } = markdownToVue(
          content.toString(),
          file,
          // do not inject pageData on HMR
          // it leads to plugin-vue to think <script> has changed and reloads
          // the component instead of re-rendering.
          // pageData needs separate HMR logic anyway (see below)
          false
        )

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
