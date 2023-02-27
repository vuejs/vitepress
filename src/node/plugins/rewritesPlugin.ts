import type { Plugin } from 'vite'
import { compile, match } from 'path-to-regexp'
import type { SiteConfig, UserConfig } from '../config'

export function resolveRewrites(
  pages: string[],
  userRewrites: UserConfig['rewrites']
) {
  const rewriteEntries = Object.entries(userRewrites || {})
  const rewrites = rewriteEntries.length
    ? Object.fromEntries(
        pages
          .map((src) => {
            for (const [from, to] of rewriteEntries) {
              const dest = rewrite(src, from, to)
              if (dest) return [src, dest]
            }
          })
          .filter((e) => e != null) as [string, string][]
      )
    : {}
  return {
    map: rewrites,
    inv: Object.fromEntries(Object.entries(rewrites).map((a) => a.reverse()))
  }
}

function rewrite(src: string, from: string, to: string) {
  const urlMatch = match(from)
  const res = urlMatch(src)
  if (!res) return false
  const toPath = compile(to)
  return toPath(res.params)
}

export const rewritesPlugin = (config: SiteConfig): Plugin => {
  return {
    name: 'vitepress:rewrites',
    configureServer(server) {
      // dev rewrite
      server.middlewares.use((req, _res, next) => {
        if (req.url) {
          const page = req.url
            .replace(/[?#].*$/, '')
            .slice(config.site.base.length)
          if (config.rewrites.inv[page]) {
            req.url = req.url.replace(page, config.rewrites.inv[page]!)
          }
        }
        next()
      })
    }
  }
}
