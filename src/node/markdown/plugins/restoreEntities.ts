import type MarkdownIt from 'markdown-it'

export function restoreEntities(md: MarkdownIt): void {
  md.core.ruler.disable('text_join')
  md.renderer.rules.text_special = (tokens, idx) => {
    if (tokens[idx].info === 'entity') {
      return tokens[idx].markup // leave as is so Vue can handle it
    }
    return md.utils.escapeHtml(tokens[idx].content)
  }
}
