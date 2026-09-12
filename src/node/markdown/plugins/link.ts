// markdown-it plugin for:
// 1. adding target="_blank" to external links
// 2. normalize internal links to end with `.html`
// 3. collecting links, with their source positions, for the dead link check

import { URL } from 'node:url'

import type { MarkdownItAsync } from 'markdown-it-async'
import type Token from 'markdown-it/lib/token.mjs'

import {
  EXTERNAL_URL_RE,
  isExternal,
  isRelativeBase,
  joinPath,
  relativePathToRoot,
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
      token.attrGet('class') !== 'header-anchor' // header anchors are already normalized
    ) {
      const hrefAttr = token.attrs![hrefIndex]
      // the destination as authored, for dead link reporting - the source
      // positions plugin captures it before include rebasing runs; fall back
      // to the current href for tokens it did not see
      const raw: string = token.meta?.vpRaw ?? safeDecodeURI(hrefAttr[1])
      let [url, frag] = hrefAttr[1].split(':~:', 2)
      hrefAttr[1] = url
      if (isExternal(url)) {
        Object.entries(externalAttrs).forEach(([key, val]) => {
          if (token.attrIndex(key) < 0) token.attrSet(key, val)
        })
        // catch localhost links as dead link
        if (url.replace(EXTERNAL_URL_RE, '').startsWith('//localhost:')) {
          pushLink(url, raw, env, token)
        }
        hrefAttr[1] = url
      } else {
        const { pathname, protocol } = new URL(url, 'http://a.com')

        if (
          // skip internal anchor links
          !url.startsWith('#') &&
          // skip mail/custom protocol links
          protocol.startsWith('http') &&
          // skip links with target/download attribute as they are meant to be opened/downloaded as-is
          token.attrIndex('target') < 0 &&
          token.attrIndex('download') < 0 &&
          // skip links to files (other than html/md)
          treatAsHtml(pathname)
        ) {
          normalizeHref(hrefAttr, env, raw, token)
        } else if (url.startsWith('#')) {
          hrefAttr[1] = decodeURI(normalizeHash(hrefAttr[1]))
        }

        // append base to internal (non-relative) urls
        if (hrefAttr[1].startsWith('/')) {
          if (isRelativeBase(base)) {
            // page-relative, so the same html works at any mount point
            if (env.relativizeUrls && env.relativePath != null) {
              hrefAttr[1] =
                relativePathToRoot(env.relativePath) + hrefAttr[1].slice(1)
            }
          } else {
            hrefAttr[1] = joinPath(base, hrefAttr[1])
          }
        }
      }
      if (frag) {
        hrefAttr[1] += (hrefAttr[1].includes('#') ? '' : '#') + ':~:' + frag
      }
    }
    return self.renderToken(tokens, idx, options)
  }

  function normalizeHref(
    hrefAttr: [string, string],
    env: MarkdownEnv,
    raw: string,
    token: Token
  ) {
    let url = hrefAttr[1]

    // directory urls need a server to resolve them, and file:// has none
    const explicitIndex = isRelativeBase(base) && !env.cleanUrls

    const indexMatch = url.match(indexRE)
    if (indexMatch) {
      const [, path, hash] = indexMatch
      url = path + (explicitIndex ? 'index.html' : '') + normalizeHash(hash)
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
      if (explicitIndex && cleanUrl.endsWith('/')) {
        cleanUrl += 'index.html'
      }
      const parsed = new URL(url, 'http://a.com')
      url = cleanUrl + parsed.search + normalizeHash(parsed.hash)
    }

    // ensure leading . for relative paths
    if (!url.startsWith('/') && !url.startsWith('./')) {
      url = './' + url
    }

    // export it for existence check
    pushLink(url, raw, env, token)

    // markdown-it encodes the uri
    hrefAttr[1] = decodeURI(url)
  }

  function normalizeHash(str: string) {
    return str ? encodeURI('#' + slugify(decodeURI(str).slice(1))) : ''
  }

  function pushLink(url: string, raw: string, env: MarkdownEnv, token: Token) {
    ;(env.links ??= []).push({ url, raw, loc: token.meta?.vpLoc })
  }
}

function safeDecodeURI(str: string): string {
  try {
    return decodeURI(str)
  } catch {
    return str
  }
}
