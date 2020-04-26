import path from 'path'
import { createServer as createViteServer, cachedRead, Plugin } from 'vite'

const debug = require('debug')('vitepress')

// built ts files are placed into /dist
const resolveAppFile = (file: string) =>
  path.join(__dirname, '../lib/app', file)

// TODO detect user configured theme
const resolveThemeFile = (file: string) =>
  path.join(__dirname, '../lib/theme-default', file)

const VitePressPlugin: Plugin = ({ root, app }) => {
  app.use(async (ctx, next) => {
    // detect and serve vitepress app files
    if (ctx.path.startsWith('/@app')) {
      const file = ctx.path.replace(/^\/@app\/?/, '')
      ctx.type = path.extname(file)
      ctx.body = await cachedRead(resolveAppFile(file))

      debug(`serving app file: ${ctx.url}`)
      return next()
    }

    if (ctx.path.startsWith('/@theme')) {
      const file = ctx.path.replace(/^\/@theme\/?/, '')
      ctx.type = path.extname(file)
      ctx.body = await cachedRead(resolveThemeFile(file))

      debug(`serving theme file: ${ctx.url}`)
      return next()
    }

    if (ctx.path.endsWith('.md')) {
      debug(`serving .md: ${ctx.path}`)
    }

    await next()
    // serve our index.html after vite history fallback
    if (ctx.url === '/index.html') {
      ctx.type = 'text/html'
      ctx.body = await cachedRead(resolveAppFile('index-dev.html'))
    }
  })
}

export function createServer() {
  return createViteServer({
    plugins: [VitePressPlugin]
  })
}
