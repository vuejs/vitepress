// markdown-it plugin for:
// 1. adding target="_blank" to external links
// 2. normalize internal links to end with `.html`

import type { MarkdownItAsync } from 'markdown-it-async'
import { URL } from 'node:url'
import {
  EXTERNAL_URL_RE,
  isExternal,
  treatAsHtml,
  type MarkdownEnv
} from '../../shared'

const indexRE = /(^|.*\/)index.md(#?.*)$/i

export const linkPlugin = (
  md: MarkdownItAsync,
  externalAttrs: Record<string, string>,
  base: string,
  slugify: (str: string) => string
) => {
  md.renderer.rules.link_open = (
    tokens,
    idx,
    options,
    env: MarkdownEnv,
    self
  ) => {
    const token = tokens[idx]
    const hrefIndex = token.attrIndex('href')
    if (
      hrefIndex >= 0 &&
      token.attrIndex('target') < 0 &&
      token.attrIndex('download') < 0 &&
      token.attrGet('class') !== 'header-anchor' // header anchors are already normalized
    ) {
      const hrefAttr = token.attrs![hrefIndex]
      const url = hrefAttr[1]
      if (isExternal(url)) {
        Object.entries(externalAttrs).forEach(([key, val]) => {
          token.attrSet(key, val)
        })
        // catch localhost links as dead link
        if (url.replace(EXTERNAL_URL_RE, '').startsWith('//localhost:')) {
          pushLink(url, env)
        }
        hrefAttr[1] = url
      } else {
        const { pathname, protocol } = new URL(url, 'http://a.com')

        if (
          // skip internal anchor links
          !url.startsWith('#') &&
          // skip mail/custom protocol links
          protocol.startsWith('http') &&
          // skip links to files (other than html/md)
          treatAsHtml(pathname)
        ) {
          normalizeHref(hrefAttr, env)
        } else if (url.startsWith('#')) {
          hrefAttr[1] = decodeURI(normalizeHash(hrefAttr[1]))
        }

        // append base to internal (non-relative) urls
        if (hrefAttr[1].startsWith('/')) {
          hrefAttr[1] = `${base}${hrefAttr[1]}`.replace(/\/+/g, '/')
        }
      }
    }
    return self.renderToken(tokens, idx, options)
  }

  function normalizeHref(hrefAttr: [string, string], env: MarkdownEnv) {
    let url = hrefAttr[1]

    const indexMatch = url.match(indexRE)
    if (indexMatch) {
      const [, path, hash] = indexMatch
      url = path + normalizeHash(hash)
    } else {
      let cleanUrl = url.replace(/[?#].*$/, '')
      // transform foo.md -> foo[.html]
      if (cleanUrl.endsWith('.md')) {
        cleanUrl = cleanUrl.replace(/\.md$/, env.cleanUrls ? '' : '.html')
      }
      // transform ./foo -> ./foo[.html]
      if (
        !env.cleanUrls &&
        !cleanUrl.endsWith('.html') &&
        !cleanUrl.endsWith('/')
      ) {
        cleanUrl += '.html'
      }
      const parsed = new URL(url, 'http://a.com')
      url = cleanUrl + parsed.search + normalizeHash(parsed.hash)
    }

    // ensure leading . for relative paths
    if (!url.startsWith('/') && !url.startsWith('./')) {
      url = './' + url
    }

    // export it for existence check
    pushLink(url.replace(/\.html$/, ''), env)

    // markdown-it encodes the uri
    hrefAttr[1] = decodeURI(url)
  }

  function normalizeHash(str: string) {
    return str ? encodeURI('#' + slugify(decodeURI(str).slice(1))) : ''
  }

  function pushLink(link: string, env: MarkdownEnv) {
    const links = env.links || (env.links = [])
    links.push(link)
  }
}
