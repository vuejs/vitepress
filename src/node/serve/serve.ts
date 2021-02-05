import sirv from 'sirv'
import compression from 'compression'
import { resolveConfig } from '../config'

export interface ServeOptions {
  root?: string
  port?: number
}

export async function serve(options: ServeOptions = {}) {
  const port = options.port !== undefined ? options.port : 5000
  const site = await resolveConfig(options.root)

  const compress = compression()
  const serve = sirv(site.outDir, {
    etag: true,
    single: true,
    maxAge: 31536000,
    immutable: true,
    setHeaders(res, pathname) {
      if (!pathname.includes('/assets/')) {
        // force server validation for non-asset files since they are not
        // fingerprinted.
        res.setHeader('cache-control', 'no-cache')
      }
    }
  })

  require('polka')()
    .use(compress, serve)
    .listen(port, (err: any) => {
      if (err) throw err
      console.log(`Built site served at http://localhost:${port}/\n`)
    })
}
