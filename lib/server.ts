import path from 'path'
import {
  createServer as createViteServer,
  cachedRead,
  Plugin,
  Resolver
} from 'vite'
import { markdownToVue } from './markdown'

const debug = require('debug')('vitepress')

// built ts files are placed into /dist
const appPath = path.join(__dirname, '../lib/app')
// TODO detect user configured theme
const themePath = path.join(__dirname, '../lib/theme-default')

const VitePressResolver: Resolver = {
  publicToFile(publicPath) {
    if (publicPath.startsWith('/@app')) {
      return path.join(appPath, publicPath.replace(/^\/@app\/?/, ''))
    }
    if (publicPath.startsWith('/@theme')) {
      return path.join(themePath, publicPath.replace(/^\/@theme\/?/, ''))
    }
  },
  fileToPublic(filePath) {
    if (filePath.startsWith(appPath)) {
      return `/@app/${path.relative(appPath, filePath)}`
    }
    if (filePath.startsWith(themePath)) {
      return `/@theme/${path.relative(themePath, filePath)}`
    }
  }
}

const VitePressPlugin: Plugin = ({ app, root, watcher, resolver }) => {
  // watch theme files if it's outside of project root
  if (path.relative(root, themePath).startsWith('..')) {
    debug(`watching theme dir outside of project root: ${themePath}`)
    watcher.add(themePath)
  }

  // hot reload .md files as .vue files
  watcher.on('change', async (file) => {
    if (file.endsWith('.md')) {
      const content = await cachedRead(null, file)
      watcher.handleVueReload(file, Date.now(), markdownToVue(content))
    }
  })

  app.use(async (ctx, next) => {
    if (ctx.path.endsWith('.md')) {
      await cachedRead(ctx, resolver.publicToFile(ctx.path))
      // let vite know this is supposed to be treated as vue file
      ctx.vue = true
      ctx.body = markdownToVue(ctx.body)
      debug(`serving ${ctx.url}`)
      return next()
    }

    // detect and serve vitepress files
    const file = VitePressResolver.publicToFile(ctx.path, root)
    if (file) {
      ctx.type = path.extname(file)
      await cachedRead(ctx, file)

      debug(`serving file: ${ctx.url}`)
      return next()
    }

    await next()

    // serve our index.html after vite history fallback
    if (ctx.url === '/index.html') {
      await cachedRead(ctx, path.join(appPath, 'index-dev.html'))
    }
  })
}

export function createServer() {
  return createViteServer({
    plugins: [VitePressPlugin],
    resolvers: [VitePressResolver]
  })
}
