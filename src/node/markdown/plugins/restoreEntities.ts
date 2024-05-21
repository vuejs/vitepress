import type MarkdownIt from 'markdown-it'
import type StateCore from 'markdown-it/lib/rules_core/state_core.mjs'
import type Token from 'markdown-it/lib/token.mjs'
import { escapeHtml } from '../../shared'

export function restoreEntities(md: MarkdownIt): void {
  md.core.ruler.at('text_join', text_join)
  md.renderer.rules.text = (tokens, idx) => escapeHtml(tokens[idx].content)
}

function text_join(state: StateCore): void {
  let curr, last
  const blockTokens = state.tokens
  const l = blockTokens.length

  for (let j = 0; j < l; ++j) {
    if (blockTokens[j].type !== 'inline') continue

    const tokens = blockTokens[j].children || []
    const max = tokens.length

    for (curr = 0; curr < max; ++curr)
      if (tokens[curr].type === 'text_special') tokens[curr].type = 'text'

    for (curr = last = 0; curr < max; ++curr)
      if (
        tokens[curr].type === 'text' &&
        curr + 1 < max &&
        tokens[curr + 1].type === 'text'
      ) {
        tokens[curr + 1].content =
          getContent(tokens[curr]) + getContent(tokens[curr + 1])
        tokens[curr + 1].info = ''
        tokens[curr + 1].markup = ''
      } else {
        if (curr !== last) tokens[last] = tokens[curr]
        ++last
      }

    if (curr !== last) tokens.length = last
  }
}

function getContent(token: Token): string {
  return token.info === 'entity'
    ? token.markup
    : token.info === 'escape' && token.content === '&'
      ? '&amp;'
      : token.content
}
