// Modified from https://github.com/egoist/markdown-it-highlight-lines
// The else part of line highlights logic is in './highlight.ts'.
// Restore the `{0}` syntax recognized and processed by the markdown-it-attrs plugin

import type { MarkdownItAsync } from 'markdown-it-async'

export const highlightLinePlugin = (md: MarkdownItAsync) => {
  const fence = md.renderer.rules.fence!
  md.renderer.rules.fence = (...args) => {
    const [tokens, idx] = args
    const token = tokens[idx]

    // due to use of markdown-it-attrs, the last `{0}` syntax would have been
    // converted to attrs on the token
    // e.g.: `js add={1} remove={2}` => `js add={1} remove=`
    //       `{2}` is stored in token.attrs
    const attr = token.attrs && token.attrs[0]

    let removedLines = null

    if (!attr) {
      return fence(...args)
    }

    removedLines = attr[0]
    if (!removedLines || !/[\d,-]+/.test(removedLines)) {
      return fence(...args)
    }

    // except for case like `js{1}`, no trailing space
    token.info += token.info.endsWith('=') ? '' : ' '
    // add the line numbers back to the token
    token.info += "{" + removedLines + "}"

    return fence(...args)
  }
}
