import { createServer, Plugin } from 'vite'
import path from 'path'
import { promises as fs } from 'fs'

const indexTemplate = fs.readFile(path.join(__dirname, '../theme/index.html'))

const VitePressPlugin: Plugin = ({ root, app }) => {
  app.use(async (ctx, next) => {
    // redirect request to index.html
    if (ctx.path === '/index.html') {
      ctx.body = await indexTemplate
      return
    }

    return next()
  })

  app.use(async (ctx, next) => {})
}

createServer({
  plugins: [VitePressPlugin]
}).listen(3000, () => {
  console.log('listening on http://localhost:3000')
})
