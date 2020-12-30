import http from 'http'
import sirv from 'sirv'
import { resolveConfig } from '../config'

export interface ServeOptions {
  root?: string
  port?: number
}

export async function serve(options: ServeOptions = {}) {
  const port = options.port !== undefined ? options.port : 5000
  const site = await resolveConfig(options.root)

  const server = http.createServer(sirv(site.outDir, { dev: true, etag: true }))
  server.listen(port, () => {
    console.log(`listening at http://localhost:${port}`)
  })
}
