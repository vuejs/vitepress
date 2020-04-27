import path from 'path'
import {
  createServer as createViteServer,
  cachedRead,
  Plugin,
  Resolver
} from 'vite'

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

const VitePressPlugin: Plugin = ({ app, root, watcher }) => {
  // watch theme files if it's outside of project root
  if (path.relative(root, themePath).startsWith('..')) {
    debug(`watching theme dir outside of project root: ${themePath}`)
    watcher.add(themePath)
  }

  app.use(async (ctx, next) => {
    // detect and serve vitepress files
    const file = VitePressResolver.publicToFile(ctx.path, root)
    if (file) {
      ctx.type = path.extname(file)
      ctx.body = await cachedRead(file)

      debug(`serving file: ${ctx.url}`)
      return next()
    }

    if (ctx.path.endsWith('.md')) {
      debug(`serving .md: ${ctx.path}`)
    }

    await next()

    // serve our index.html after vite history fallback
    if (ctx.url === '/index.html') {
      ctx.type = 'text/html'
      ctx.body = await cachedRead(path.join(appPath, 'index-dev.html'))
    }
  })
}

export function createServer() {
  return createViteServer({
    plugins: [VitePressPlugin],
    resolvers: [VitePressResolver]
  })
}
