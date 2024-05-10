// markdown-it plugin for generating line numbers.
// It depends on preWrapper plugin.

import type MarkdownIt from 'markdown-it'
import type { MarkdownOptions } from '../markdown'

export const codeModalPlugin = (
  md: MarkdownIt,
  enable = false,
  options: MarkdownOptions = {}
) => {
  const fence = md.renderer.rules.fence!
  md.renderer.rules.fence = (...args) => {
    const rawCode = fence(...args)

    const [tokens, idx] = args
    const info = tokens[idx].info

    if (
      (!enable && !/:modal($| |=)/.test(info)) ||
      (enable && /:no-modal($| )/.test(info))
    ) {
      return rawCode
    }

    const code =
      `<button title="${options.codeModalButtonTitle}" class="modal"></button>` +
      '<div class="modal-container">' +
      fence(...args) +
      '</div>'

    let end = rawCode.lastIndexOf('</div>')

    return rawCode.substring(0, end) + code + '</div>'
  }
}
