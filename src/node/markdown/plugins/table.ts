import type { MarkdownItAsync } from 'markdown-it-async'

// Wraps tables so themes can control overflow independently from table sizing,
// and adds tabindex="0" so they can be scrolled with the keyboard.
export const tablePlugin = (
  md: MarkdownItAsync,
  { tableTabIndex = true }: { tableTabIndex?: boolean } = {}
) => {
  const tableOpen = md.renderer.rules.table_open
  const tableClose = md.renderer.rules.table_close

  md.renderer.rules.table_open = function (tokens, idx, options, env, self) {
    const token = tokens[idx]
    if (tableTabIndex && token.attrIndex('tabindex') < 0) {
      token.attrSet('tabindex', '0')
    }
    const rendered = tableOpen
      ? tableOpen(tokens, idx, options, env, self)
      : self.renderToken(tokens, idx, options)
    return `<div class="vp-table-wrapper">\n${rendered}`
  }

  md.renderer.rules.table_close = function (tokens, idx, options, env, self) {
    const rendered = tableClose
      ? tableClose(tokens, idx, options, env, self)
      : self.renderToken(tokens, idx, options)
    return `${rendered}</div>\n`
  }
}
