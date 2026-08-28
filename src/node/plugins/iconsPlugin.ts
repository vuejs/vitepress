import c from 'picocolors'
import type { Plugin } from 'vite'

import { resolveIconSVG } from '../icons'
import type { SiteConfig } from '../siteConfig'

const iconRequestRE = /\/@vpicons\/([a-z0-9-]+)\/([a-z0-9-]+)\.svg$/

/**
 * Serves `/@vpicons/<collection>/<name>.svg` in dev from locally installed
 * `@iconify-json/*` collections (requested on demand by `useIcon`).
 */
export function iconsPlugin(siteConfig: SiteConfig): Plugin {
  const warned = new Set<string>()
  return {
    name: 'vitepress:icons',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const match = req.url?.split('?')[0].match(iconRequestRE)
        if (!match) return next()
        const [, collection, icon] = match
        const resolved = await resolveIconSVG(siteConfig.root, collection, icon)
        if ('svg' in resolved) {
          res.setHeader('Content-Type', 'image/svg+xml')
          res.setHeader('Cache-Control', 'no-cache')
          res.end(resolved.svg)
        } else {
          const key = `${collection}:${icon}`
          if (!warned.has(key)) {
            warned.add(key)
            siteConfig.logger.warn(c.yellow(`(icons) ${resolved.error}`))
          }
          res.statusCode = 404
          res.end()
        }
      })
    }
  }
}
