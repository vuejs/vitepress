import Koa from 'koa'
import koaServe from 'koa-static'
import { resolveConfig } from '../config'

export interface ServeOptions {
  root?: string
  port?: number
}

export async function serve(options: ServeOptions = {}) {
  const port = options.port !== undefined ? options.port : 3000
  const site = await resolveConfig(options.root)

  const app = new Koa()

  app.use(koaServe(site.outDir))

  app.listen(port)

  console.log(`listening at http://localhost:${port}`)
}
