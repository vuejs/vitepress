import type MarkdownIt from 'markdown-it'

export function restoreEntities(md: MarkdownIt): void {
  md.core.ruler.before('text_join', 'entity', (state) => {
    for (const token of state.tokens) {
      if (token.type !== 'inline' || !token.children) continue

      for (const child of token.children) {
        if (child.type === 'text_special' && child.info === 'entity') {
          child.type = 'entity'
        }
      }
    }
  })

  md.renderer.rules.entity = (tokens, idx) => {
    return tokens[idx].markup // leave as is so Vue can handle it
  }
}
