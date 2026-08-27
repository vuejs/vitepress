import { once } from 'node:events'
import path from 'node:path'

import compression from '@polka/compression'
import polka, { type IOptions } from 'polka'
import sirv from 'sirv'

import { normalizeAssetsBase, resolveConfig } from '../config'
import { EXTERNAL_URL_RE, isRelativeBase } from '../shared'
import { readFile } from '../utils/fs'

export interface ServeOptions {
  base?: string
  assetsBase?: string
  root?: string
  port?: number
}

export async function serve(options: ServeOptions = {}) {
  const port = options.port ?? 4173
  const config = await resolveConfig(options.root, 'serve', 'production')

  const assetsBase =
    typeof options.assetsBase === 'string'
      ? normalizeAssetsBase(options.assetsBase)
      : config.assetsBase

  let rawBase =
    (typeof options.base === 'string' ? options.base : undefined) ??
    config?.site?.base ??
    '/'
  if (isRelativeBase(rawBase)) {
    // a relative base works at any mount point; serve it at the root
    rawBase = '/'
  } else if (EXTERNAL_URL_RE.test(rawBase)) {
    rawBase = new URL(rawBase, 'http://a.com').pathname
  }
  const base = rawBase.replace(/^\/+|\/+$/g, '')

  const notAnAsset = (pathname: string) =>
    !pathname.includes(`/${config.assetsDir}/`)
  const notFound = await readFile(path.resolve(config.outDir, './404.html'))
  const onNoMatch: IOptions['onNoMatch'] = (req, res) => {
    if (base && req.path === '/') {
      res.statusCode = 302
      res.setHeader('location', `/${base}/`)
      res.end()
      return
    }
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

  const app = polka({ onNoMatch })

  if (assetsBase) {
    if (EXTERNAL_URL_RE.test(assetsBase)) {
      config.logger.info(
        `assetsBase is external (${assetsBase}) — assets will be ` +
          `requested from that URL, not from this preview server.`
      )
    } else {
      // mirror the asset subtree at the configured prefix
      const assetsPath = `${assetsBase}${config.assetsDir}`.replace(/\/+$/, '')
      app.use(
        assetsPath,
        compress,
        sirv(path.join(config.outDir, config.assetsDir), {
          etag: true,
          maxAge: 31536000,
          immutable: true
        })
      )
    }
  }

  if (base) app.use(base, compress, serve)
  else app.use(compress, serve)

  app.listen(port)
  await once(app.server, 'listening')
  config.logger.info(
    `Built site served at http://localhost:${port}/${base ? `${base}/` : ''}`
  )

  return app
}
