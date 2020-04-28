import path from 'path'
import {
  createServer as createViteServer,
  cachedRead,
  Plugin,
  ServerConfig
} from 'vite'
import {
  resolveConfig,
  ResolvedConfig,
  getConfigPath,
  resolveSiteData
} from './resolveConfig'
import { createMarkdownToVueRenderFn } from './markdownToVue'
import { APP_PATH, SITE_DATA_REQUEST_PATH } from './utils/pathResolver'

const debug = require('debug')('vitepress:serve')
const debugHmr = require('debug')('vitepress:hmr')

function createVitePressPlugin(config: ResolvedConfig): Plugin {
  const {
    themePath,
    site: initialSiteData,
    resolver: vitepressResolver
  } = config

  return ({ app, root, watcher, resolver }) => {
    const markdownToVue = createMarkdownToVueRenderFn(root)

    // watch vitepress container app (only when developing vitepress itself)
    if (process.env.VITEPRESS_DEV) {
      watcher.add(APP_PATH)
    }

    // watch theme files if it's outside of project root
    if (path.relative(root, themePath).startsWith('..')) {
      debugHmr(`watching theme dir outside of project root: ${themePath}`)
      watcher.add(themePath)
    }

    // hot reload .md files as .vue files
    watcher.on('change', async (file) => {
      if (file.endsWith('.md')) {
        debugHmr(`reloading ${file}`)
        const content = await cachedRead(null, file)
        const timestamp = Date.now()
        watcher.handleVueReload(
          file,
          timestamp,
          markdownToVue(content, file, timestamp)
        )
      }
    })

    // hot reload handling for siteData
    // the data is stringified twice so it is sent to the client as a string
    // it is then parsed on the client via JSON.parse() which is faster than
    // parsing the object literal as JavaScript.
    let siteData = initialSiteData
    let stringifiedData = JSON.stringify(JSON.stringify(initialSiteData))
    const configPath = getConfigPath(root)
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
        ctx.body = markdownToVue(ctx.body, file, ctx.lastModified.getTime())
        debug(ctx.url, ctx.status)
        return next()
      }

      // detect and serve vitepress @app / @theme files
      const file = vitepressResolver.requestToFile(ctx.path, root)
      if (file) {
        await cachedRead(ctx, file)
        debug(ctx.url, ctx.status)
        await next()
        return
      }

      await next()

      // serve our index.html after vite history fallback
      if (ctx.url.endsWith('.html')) {
        await cachedRead(ctx, path.join(APP_PATH, 'index-dev.html'))
      }
    })
  }
}

export async function createServer(options: ServerConfig = {}) {
  const config = await resolveConfig(options.root || process.cwd())

  return createViteServer({
    ...options,
    plugins: [createVitePressPlugin(config)],
    resolvers: [config.resolver]
  })
}
