import type { Plugin } from 'vite'
import { compile, match } from 'path-to-regexp'
import type { SiteConfig, UserConfig } from '../siteConfig'

export function resolveRewrites(
  pages: string[],
  userRewrites: UserConfig['rewrites']
) {
  const rewriteRules = Object.entries(userRewrites || {}).map(([from, to]) => ({
    toPath: compile(to),
    matchUrl: match(from.startsWith('^') ? new RegExp(from) : from)
  }))

  const pageToRewrite: Record<string, string> = {}
  const rewriteToPage: Record<string, string> = {}
  if (rewriteRules.length) {
    for (const page of pages) {
      for (const { matchUrl, toPath } of rewriteRules) {
        const res = matchUrl(page)
        if (res) {
          const dest = toPath(res.params)
          pageToRewrite[page] = dest
          rewriteToPage[dest] = page
          break
        }
      }
    }
  }

  return {
    map: pageToRewrite,
    inv: rewriteToPage
  }
}

export const rewritesPlugin = (config: SiteConfig): Plugin => {
  return {
    name: 'vitepress:rewrites',
    configureServer(server) {
      // dev rewrite
      server.middlewares.use((req, _res, next) => {
        if (req.url) {
          const page = decodeURI(req.url)
            .replace(/[?#].*$/, '')
            .slice(config.site.base.length)

          if (config.rewrites.inv[page]) {
            req.url = req.url.replace(
              encodeURI(page),
              encodeURI(config.rewrites.inv[page]!)
            )
          }
        }
        next()
      })
    }
  }
}
