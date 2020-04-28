// markdown-it plugin for:
// 1. adding target="_blank" to external links
// 2. normalize internal links to end with `.html`

import MarkdownIt from 'markdown-it'
import { MarkdownParsedData } from '../markdown'

const indexRE = /(^|.*\/)(index|readme).md(#?.*)$/i

export const linkPlugin = (
  md: MarkdownIt & { __data: MarkdownParsedData },
  externalAttrs: Record<string, string>
) => {
  md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    const token = tokens[idx]
    const hrefIndex = token.attrIndex('href')
    if (hrefIndex >= 0) {
      const hrefAttr = token.attrs![hrefIndex]
      const url = hrefAttr[1]
      const isExternal = /^https?:/.test(url)
      if (isExternal) {
        Object.entries(externalAttrs).forEach(([key, val]) => {
          token.attrSet(key, val)
        })
      } else if (!url.startsWith('#')) {
        normalizeHref(hrefAttr)
      }
    }
    return self.renderToken(tokens, idx, options)
  }

  function normalizeHref(hrefAttr: [string, string]) {
    let url = hrefAttr[1]

    const indexMatch = url.match(indexRE)
    if (indexMatch) {
      const [, path, , hash] = indexMatch
      url = path + hash
    } else {
      url = url.replace(/\.md$/, '.html').replace(/\.md(#.*)$/, '.html$1')
    }

    // relative path usage.
    if (!url.startsWith('/')) {
      url = ensureBeginningDotSlash(url)
    }

    // export it for existence check
    const data = md.__data
    const links = data.links || (data.links = [])
    links.push(url)

    // markdown-it encodes the uri
    hrefAttr[1] = decodeURI(url)
  }
}

const beginningSlashRE = /^\.\//
const ensureBeginningDotSlash = (path: string) => {
  if (beginningSlashRE.test(path)) {
    return path
  }
  return './' + path
}
