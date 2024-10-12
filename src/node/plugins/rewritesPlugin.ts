import type { Plugin } from 'vite'
import { compile, match } from 'path-to-regexp'
import type { SiteConfig, UserConfig } from '../siteConfig'

export function resolveRewrites(
  pages: string[],
  userRewrites: UserConfig['rewrites']
) {
  const pageToRewrite: Record<string, string> = {}
  const rewriteToPage: Record<string, string> = {}

  if (typeof userRewrites === 'function') {
    for (const page of pages) {
      const dest = userRewrites(page)
      if (dest && dest !== page) {
        pageToRewrite[page] = dest
        rewriteToPage[dest] = page
      }
    }
  } else if (typeof userRewrites === 'object') {
    const rewriteRules = Object.entries(userRewrites || {}).map(
      ([from, to]) => ({
        toPath: compile(`/${to}`, { validate: false }),
        matchUrl: match(from.startsWith('^') ? new RegExp(from) : from)
      })
    )

    if (rewriteRules.length) {
      for (const page of pages) {
        for (const { matchUrl, toPath } of rewriteRules) {
          const res = matchUrl(page)
          if (res) {
            const dest = toPath(res.params).slice(1)
            pageToRewrite[page] = dest
            rewriteToPage[dest] = page
            break
          }
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
