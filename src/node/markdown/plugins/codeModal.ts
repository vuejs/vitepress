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

    let end = rawCode.lastIndexOf('</div>')

    let innerCode =
      rawCode.substring(0, end) +
      `<button title="${options.codeModalButtonTitle}" class="close"></button>` +
      '</div>'

    const modal =
      `<button title="${options.codeModalButtonTitle}" class="modal"></button>` +
      '<div class="modal-container">' +
      innerCode +
      '</div>'

    return rawCode.substring(0, end) + modal + '</div>'
  }
}
