import path from 'path'
import {
  createServer as createViteServer,
  cachedRead,
  ServerConfig,
  ServerPlugin
} from 'vite'
import { resolveConfig, SiteConfig, resolveSiteData } from './config'
import { createMarkdownToVueRenderFn } from './markdownToVue'
import { APP_PATH, SITE_DATA_REQUEST_PATH } from './utils/pathResolver'

const debug = require('debug')('vitepress:serve')
const debugHmr = require('debug')('vitepress:hmr')

function createVitePressPlugin({
  themeDir,
  configPath,
  site: initialSiteData
}: SiteConfig): ServerPlugin {
  return ({ app, root, watcher, resolver }) => {
    const markdownToVue = createMarkdownToVueRenderFn(root)

    // watch vitepress container app (only when developing vitepress itself)
    if (process.env.VITEPRESS_DEV) {
      watcher.add(APP_PATH)
    }

    // watch theme files if it's outside of project root
    if (path.relative(root, themeDir).startsWith('..')) {
      debugHmr(`watching theme dir outside of project root: ${themeDir}`)
      watcher.add(themeDir)
    }

    // hot reload .md files as .vue files
    watcher.on('change', async (file) => {
      if (file.endsWith('.md')) {
        debugHmr(`reloading ${file}`)
        const content = await cachedRead(null, file)
        const timestamp = Date.now()
        const { pageData, vueSrc } = markdownToVue(
          content,
          file,
          timestamp,
          // do not inject pageData on HMR
          // it leads to vite to think <script> has changed and reloads the
          // component instead of re-rendering.
          // pageData needs separate HMR logic anyway (see below)
          false
        )

        // notify the client to update page data
        watcher.send({
          type: 'custom',
          id: 'vitepress:pageData',
          customData: {
            path: resolver.fileToRequest(file),
            pageData
          },
          timestamp: Date.now()
        })

        // reload the content component
        watcher.handleVueReload(file, timestamp, vueSrc)
      }
    })

    // hot reload handling for siteData
    // the data is stringified twice so it is sent to the client as a string
    // it is then parsed on the client via JSON.parse() which is faster than
    // parsing the object literal as JavaScript.
    let siteData = initialSiteData
    let stringifiedData = JSON.stringify(JSON.stringify(initialSiteData))
    watcher.add(configPath)
    watcher.on('change', async (file) => {
      if (file === configPath) {
        const newData = await resolveSiteData(root)
        stringifiedData = JSON.stringify(JSON.stringify(newData))
        if (newData.base !== siteData.base) {
          console.warn(
            `[vitepress]: config.base has changed. Please restart the dev server.`
          )
        }
        siteData = newData
        watcher.handleJSReload(SITE_DATA_REQUEST_PATH)
      }
    })

    // inject Koa middleware
    app.use(async (ctx, next) => {
      // serve siteData (which is a virtual file)
      if (ctx.path === SITE_DATA_REQUEST_PATH) {
        ctx.type = 'js'
        ctx.body = `export default ${stringifiedData}`
        debug(ctx.url)
        return
      }

      // handle .md -> vue transforms
      if (ctx.path.endsWith('.md')) {
        const file = resolver.requestToFile(ctx.path)
        await cachedRead(ctx, file)

        // let vite know this is supposed to be treated as vue file
        ctx.vue = true

        const { vueSrc, pageData } = markdownToVue(
          ctx.body,
          file,
          ctx.lastModified.getTime(),
          false
        )
        ctx.body = vueSrc
        debug(ctx.url, ctx.status)

        await next()

        // make sure this is the main <script> block
        if (!ctx.query.type) {
          // inject pageData to generated script
          ctx.body += `\nexport const __pageData = ${JSON.stringify(
            JSON.stringify(pageData)
          )}`
        }
        return
      }

      await next()

      // serve our index.html after vite history fallback
      if (ctx.url.endsWith('.html')) {
        await cachedRead(ctx, path.join(APP_PATH, 'index.html'))
      }
    })
  }
}

export async function createServer(options: ServerConfig = {}) {
  const config = await resolveConfig(options.root)

  return createViteServer({
    ...options,
    plugins: [createVitePressPlugin(config)],
    resolvers: [config.resolver]
  })
}
