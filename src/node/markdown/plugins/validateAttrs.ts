import type { MarkdownItAsync } from 'markdown-it-async'
import type StateCore from 'markdown-it/lib/rules_core/state_core.mjs'
import type Token from 'markdown-it/lib/token.mjs'
import type { MarkdownEnv } from '../../shared'

export function validateAttrsPlugin(md: MarkdownItAsync): void {
  md.core.ruler.after(
    'curly_attributes',
    'vitepress_validate_attrs',
    (state) => {
      for (const token of state.tokens) {
        validateTokenAttrs(state, token)
      }
    }
  )
}

function validateTokenAttrs(
  state: StateCore,
  token: Token,
  locationToken = token
): void {
  if (token.attrs) {
    const seen = new Set<string>()

    for (const [name] of token.attrs) {
      if (seen.has(name)) {
        throw new Error(
          `${formatLocation(state, locationToken)}: Duplicate attribute "${name}" from markdown-it-attrs. Check the attribute block or wrap it in code.`
        )
      }
      seen.add(name)
    }
  }

  for (const child of token.children || []) {
    validateTokenAttrs(state, child, token)
  }
}

function formatLocation(state: StateCore, token: Token): string {
  const env = state.env as MarkdownEnv | undefined
  const file = env?.realPath || env?.path || env?.relativePath || 'Markdown'
  const line = token.map?.[0]

  return line == null ? file : `${file}:${line + 1}`
}
