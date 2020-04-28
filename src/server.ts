import path from 'path'
import {
  createServer as createViteServer,
  cachedRead,
  Plugin,
  ServerConfig
} from 'vite'
import { resolveConfig, ResolvedConfig } from './resolveConfig'
import { createMarkdownToVueRenderFn } from './markdown/markdownToVue'
import { APP_PATH } from './utils/pathResolver'

const debug = require('debug')('vitepress:serve')
const debugHmr = require('debug')('vitepress:hmr')

function createVitePressPlugin({
  themePath,
  resolver: vitepressResolver
}: ResolvedConfig): Plugin {
  return ({ app, root, watcher, resolver }) => {
    const markdownToVue = createMarkdownToVueRenderFn(root)

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
        watcher.handleVueReload(file, Date.now(), markdownToVue(content, file))
      }
    })

    // inject Koa middleware
    app.use(async (ctx, next) => {
      // handle .md -> vue transforms
      if (ctx.path.endsWith('.md')) {
        const file = resolver.publicToFile(ctx.path)
        await cachedRead(ctx, file)
        // let vite know this is supposed to be treated as vue file
        ctx.vue = true
        ctx.body = markdownToVue(ctx.body, file)
        debug(ctx.url, ctx.status)
        return next()
      }

      // detect and serve vitepress @app / @theme files
      const file = vitepressResolver.publicToFile(ctx.path, root)
      if (file) {
        await cachedRead(ctx, file)
        debug(ctx.url, ctx.status)
        await next()
        return
      }

      await next()

      // serve our index.html after vite history fallback
      if (ctx.url === '/index.html') {
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
