// markdown-it plugin for:
// 1. adding target="_blank" to external links
// 2. normalize internal links to end with `.html`

import MarkdownIt from 'markdown-it'
import { MarkdownRenderer } from '../markdown'
import { URL } from 'url'
import { EXTERNAL_URL_RE, CleanUrlsMode } from '../../shared'

const indexRE = /(^|.*\/)index.md(#?.*)$/i

export const linkPlugin = (
  md: MarkdownIt,
  externalAttrs: Record<string, string>,
  base: string
) => {
  md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    const token = tokens[idx]
    const hrefIndex = token.attrIndex('href')
    if (hrefIndex >= 0) {
      const hrefAttr = token.attrs![hrefIndex]
      const url = hrefAttr[1]
      const isExternal = EXTERNAL_URL_RE.test(url)
      if (isExternal) {
        Object.entries(externalAttrs).forEach(([key, val]) => {
          token.attrSet(key, val)
        })
        // catch localhost links as dead link
        if (url.replace(EXTERNAL_URL_RE, '').startsWith('//localhost:')) {
          pushLink(url)
        }
      } else if (
        // internal anchor links
        !url.startsWith('#') &&
        // mail links
        !url.startsWith('mailto:') &&
        // links to files (other than html/md)
        !/\.(?!html|md)\w+($|\?)/i.test(url)
      ) {
        normalizeHref(hrefAttr, env.cleanUrl)
      }

      // encode vite-specific replace strings in case they appear in URLs
      // this also excludes them from build-time replacements (which injects
      // <wbr/> and will break URLs)
      hrefAttr[1] = hrefAttr[1]
        .replace(/\bimport\.meta/g, 'import%2Emeta')
        .replace(/\bprocess\.env/g, 'process%2Eenv')
    }
    return self.renderToken(tokens, idx, options)
  }

  function normalizeHref(
    hrefAttr: [string, string],
    shouldCleanUrls: CleanUrlsMode
  ) {
    let url = hrefAttr[1]

    const indexMatch = url.match(indexRE)
    if (indexMatch) {
      const [, path, hash] = indexMatch
      url = path + hash
    } else {
      let cleanUrl = url.replace(/[?#].*$/, '')
      // transform foo.md -> foo[.html]
      if (cleanUrl.endsWith('.md')) {
        cleanUrl = cleanUrl.replace(
          /\.md$/,
          shouldCleanUrls === 'disabled' ? '.html' : ''
        )
      }
      // transform ./foo -> ./foo[.html]
      if (
        shouldCleanUrls === 'disabled' &&
        !cleanUrl.endsWith('.html') &&
        !cleanUrl.endsWith('/')
      ) {
        cleanUrl += '.html'
      }
      const parsed = new URL(url, 'http://a.com')
      url = cleanUrl + parsed.search + parsed.hash
    }

    // ensure leading . for relative paths
    if (!url.startsWith('/') && !/^\.\//.test(url)) {
      url = './' + url
    }

    // export it for existence check
    pushLink(url.replace(/\.html$/, ''))

    // append base to internal (non-relative) urls
    if (url.startsWith('/')) {
      url = `${base}${url}`.replace(/\/+/g, '/')
    }

    // markdown-it encodes the uri
    hrefAttr[1] = decodeURI(url)
  }

  function pushLink(link: string) {
    const data = (md as MarkdownRenderer).__data
    const links = data.links || (data.links = [])
    links.push(link)
  }
}
