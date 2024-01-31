// Modified from https://github.com/egoist/markdown-it-highlight-lines
// Now this plugin is only used to normalize line attrs.
// The else part of line highlights logic is in './highlight.ts'.

import type MarkdownIt from 'markdown-it'

const RE = /{([\d,-]+)}/

export const highlightLinePlugin = (md: MarkdownIt) => {
  const fence = md.renderer.rules.fence!
  md.renderer.rules.fence = (...args) => {
    const [tokens, idx] = args
    const token = tokens[idx]

    // due to use of markdown-it-attrs, the {0} syntax would have been
    // converted to attrs on the token
    let highlightLineAttr
    if (token.attrs) {
      token.attrs = token.attrs.filter((x) => {
        const isHighlightLineAttr = /^[\d,-]+$/.test(x[0])

        if (isHighlightLineAttr) {
          highlightLineAttr = x
        }

        return !isHighlightLineAttr
      })
    }

    let lines = null

    if (!highlightLineAttr) {
      // markdown-it-attrs maybe disabled
      const rawInfo = token.info

      if (!rawInfo || !RE.test(rawInfo)) {
        return fence(...args)
      }

      const langName = rawInfo.replace(RE, '').trim()

      // ensure the next plugin get the correct lang
      token.info = langName

      lines = RE.exec(rawInfo)![1]
    }

    if (!lines) {
      lines = highlightLineAttr![0]

      if (!lines || !/[\d,-]+/.test(lines)) {
        return fence(...args)
      }
    }

    token.info += ' ' + lines
    return fence(...args)
  }
}
