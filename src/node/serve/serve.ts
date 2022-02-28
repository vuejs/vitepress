import sirv from 'sirv'
import compression from 'compression'
import { resolveConfig } from '../config'
import polka from 'polka'

function trimChar(str: string, char: string) {
  while (str.charAt(0) === char) {
    str = str.substring(1)
  }

  while (str.charAt(str.length - 1) === char) {
    str = str.substring(0, str.length - 1)
  }

  return str
}

export interface ServeOptions {
  root?: string
  port?: number
}

export async function serve(options: ServeOptions = {}) {
  const port = options.port !== undefined ? options.port : 5000
  const site = await resolveConfig(options.root, 'serve', 'production')
  const base = trimChar(site?.site?.base ?? '', '/')

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

  if (base) {
    polka()
      .use(base, compress, serve)
      .listen(port, (err: any) => {
        if (err) throw err
        console.log(`Built site served at http://localhost:${port}/${base}/\n`)
      })
  } else {
    polka()
      .use(compress, serve)
      .listen(port, (err: any) => {
        if (err) throw err
        console.log(`Built site served at http://localhost:${port}/\n`)
      })
  }
}
