import path from 'path'
import { createServer as createViteServer, cachedRead, Plugin } from 'vite'
import { createMarkdownFn } from './markdownToVue'
import { VitePressResolver, THEME_PATH, APP_PATH } from './resolver'

const debug = require('debug')('vitepress:serve')
const debugHmr = require('debug')('vitepress:hmr')

const VitePressPlugin: Plugin = ({ app, root, watcher, resolver }) => {
  const markdownToVue = createMarkdownFn(root)

  // watch theme files if it's outside of project root
  if (path.relative(root, THEME_PATH).startsWith('..')) {
    debugHmr(`watching theme dir outside of project root: ${THEME_PATH}`)
    watcher.add(THEME_PATH)
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
      debug(ctx.url)
      return next()
    }

    // detect and serve vitepress @app / @theme files
    const file = VitePressResolver.publicToFile(ctx.path, root)
    if (file) {
      ctx.type = path.extname(file)
      await cachedRead(ctx, file)

      debug(ctx.url)
      return next()
    }

    await next()

    // serve our index.html after vite history fallback
    if (ctx.url === '/index.html') {
      await cachedRead(ctx, path.join(APP_PATH, 'index-dev.html'))
    }
  })
}

export function createServer() {
  return createViteServer({
    plugins: [VitePressPlugin],
    resolvers: [VitePressResolver]
  })
}
