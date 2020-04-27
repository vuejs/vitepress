// markdown-it plugin for:
// 1. adding target="_blank" to external links
// 2. normalize internal links to end with `.html`

import MarkdownIt from 'markdown-it'

const indexRE = /(^|.*\/)(index|readme).md(#?.*)$/i

export const linkPlugin = (
  md: MarkdownIt,
  externalAttrs: Record<string, string>
) => {
  md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    const token = tokens[idx]
    const hrefIndex = token.attrIndex('href')
    if (hrefIndex >= 0) {
      const hrefAttr = token.attrs![hrefIndex]
      const url = hrefAttr[1]
      const isExternal = /^https?:/.test(url)
      const isSourceLink = /(\/|\.md|\.html)(#.*)?$/.test(url)
      if (isExternal) {
        Object.entries(externalAttrs).forEach(([key, val]) => {
          token.attrSet(key, val)
        })
      } else if (isSourceLink) {
        normalizeHref(hrefAttr)
      }
    }
    return self.renderToken(tokens, idx, options)
  }

  function normalizeHref(hrefAttr: [string, string]) {
    const data = (md as any).__data
    let url = hrefAttr[1]

    // convert link to filename and export it for existence check
    const links = data.links || (data.links = [])
    links.push(url)

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
