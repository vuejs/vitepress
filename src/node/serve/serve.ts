import compression from '@polka/compression'
import { once } from 'node:events'
import path from 'node:path'
import polka, { type IOptions } from 'polka'
import sirv from 'sirv'
import { resolveConfig } from '../config'
import { readFile } from '../utils/fs'

export interface ServeOptions {
  base?: string
  root?: string
  port?: number
}

export async function serve(options: ServeOptions = {}) {
  const port = options.port ?? 4173
  const config = await resolveConfig(options.root, 'serve', 'production')
  const base = (options?.base ?? config?.site?.base ?? '').replace(
    /^\/+|\/+$/g,
    ''
  )

  const notAnAsset = (pathname: string) =>
    !pathname.includes(`/${config.assetsDir}/`)
  const notFound = await readFile(path.resolve(config.outDir, './404.html'))
  const onNoMatch: IOptions['onNoMatch'] = (req, res) => {
    res.statusCode = 404
    if (notAnAsset(req.path)) res.write(notFound)
    res.end()
  }

  const compress = compression()
  const serve = sirv(config.outDir, {
    etag: true,
    maxAge: 31536000,
    immutable: true,
    setHeaders(res, pathname) {
      if (notAnAsset(pathname)) {
        // force server validation for non-asset files since they
        // are not fingerprinted
        res.setHeader('cache-control', 'no-cache')
      }
    }
  })

  const app = base
    ? polka({ onNoMatch }).use(base, compress, serve)
    : polka({ onNoMatch }).use(compress, serve)

  app.listen(port)
  await once(app.server, 'listening')
  config.logger.info(
    `Built site served at http://localhost:${port}/${base ? `${base}/` : ''}`
  )

  return app
}
