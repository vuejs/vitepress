import type { MarkdownItAsync } from 'markdown-it-async'

// adds tabindex="0" to tables so they are focusable and can be
// scrolled with the keyboard when they overflow horizontally
export const tablePlugin = (md: MarkdownItAsync) => {
  const tableOpen = md.renderer.rules.table_open
  md.renderer.rules.table_open = function (tokens, idx, options, env, self) {
    const token = tokens[idx]
    if (token.attrIndex('tabindex') < 0) token.attrPush(['tabindex', '0'])
    return tableOpen
      ? tableOpen(tokens, idx, options, env, self)
      : self.renderToken(tokens, idx, options)
  }
}
