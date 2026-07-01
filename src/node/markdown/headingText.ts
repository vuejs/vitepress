interface MarkdownToken {
  type: string
  content: string
  meta?: Record<string, unknown>
}

const badgeOpenRE = /^<Badge(?:\s|>|\/)/i
const badgeCloseRE = /^<\/Badge\s*>$/i
const selfClosingTagRE = /\/\s*>$/

export function getHeadingTokensText(tokens: MarkdownToken[] = []) {
  let result = ''
  let skipBadgeContent = false

  for (const token of tokens) {
    if (token.meta?.isPermalinkSymbol) continue

    if (token.type === 'html_inline') {
      if (badgeOpenRE.test(token.content)) {
        skipBadgeContent = !selfClosingTagRE.test(token.content)
        continue
      }

      if (skipBadgeContent && badgeCloseRE.test(token.content)) {
        skipBadgeContent = false
      }

      continue
    }

    if (skipBadgeContent || token.type === 'emoji') continue

    result += token.content
  }

  return result
}
