import compression from '@polka/compression'
import fs from 'fs-extra'
import path from 'path'
import polka, { type IOptions } from 'polka'
import sirv from 'sirv'
import { resolveConfig } from '../config'
import { isExternal } from '../shared'
import { getDefaultAssetsBase, isDefaultAssetsBase } from '../utils/assetsBase'

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
  base?: string
  root?: string
  port?: number
}

export async function serve(options: ServeOptions = {}) {
  const port = options.port ?? 4173
  const config = await resolveConfig(options.root, 'serve', 'production')
  const base = trimChar(options?.base ?? config?.site?.base ?? '', '/')

  const notAnAsset = (pathname: string) =>
    !pathname.includes(`/${config.assetsDir}/`)
  const notFound = fs.readFileSync(path.resolve(config.outDir, './404.html'))
  const onNoMatch: IOptions['onNoMatch'] = (req, res) => {
    res.statusCode = 404
    if (notAnAsset(req.path)) res.write(notFound.toString())
    res.end()
  }

  const compress = compression({ brotli: true })
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

  const server = polka({ onNoMatch })

  const assetsBase = config.site.assetsBase
  if (isExternal(assetsBase)) {
    config.logger.warn(
      `Using external assets base (${assetsBase}) will break assets serving`
    )
  } else if (!isDefaultAssetsBase(config.site.base, assetsBase)) {
    const defaultAssetsBase = getDefaultAssetsBase(
      options.base ?? config.site.base
    )

    // redirect non-default asset requests
    server.use((req, res, next) => {
      if (req.url.startsWith(assetsBase)) {
        res.statusCode = 307
        res.setHeader(
          'Location',
          `${defaultAssetsBase}${req.url.slice(assetsBase.length)}`
        )
        res.end()
      } else {
        next()
      }
    })
  }

  if (base) {
    server.use(base, compress, serve).listen(port, () => {
      config.logger.info(
        `Built site served at http://localhost:${port}/${base}/`
      )
    })
  } else {
    server.use(compress, serve).listen(port, () => {
      config.logger.info(`Built site served at http://localhost:${port}/`)
    })
  }

  return server
}
