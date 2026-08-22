import type { MarkdownItAsync } from 'markdown-it-async'
import type Token from 'markdown-it/lib/token.mjs'
import type { MarkdownEnv } from '../../shared'

const expressionRE = /\{\{\s*\$frontmatter((?:\.[A-Za-z_$][\w$]*)+)\s*\}\}/g
const tagRE = /^<(\/?)([A-Za-z][\w-]*)/
const vPreRE = /^<[A-Za-z][\w-]*\s[^>]*(?<=\s)v-pre(?=[\s=/>])/

/**
 * Resolves `{{ $frontmatter.some.key }}` in text to the page's frontmatter at
 * render time, so that the value also reaches consumers that never run Vue -
 * the search index, content loaders and `renderMd()` - and Vue has nothing
 * left to interpolate. Anything this can't resolve (missing keys, non-primitive
 * values, expressions beyond a property path) is left for Vue, as is
 * everything inside code, `::: v-pre` containers and inline `v-pre` elements.
 */
export const frontmatterExpressionsPlugin = (md: MarkdownItAsync) => {
  md.core.ruler.after('text_join', 'vp_frontmatter_expressions', (state) => {
    const { frontmatter } = state.env as MarkdownEnv
    if (!frontmatter) return
    let preDepth = 0
    for (const token of state.tokens) {
      if (token.type === 'container_v-pre_open') preDepth++
      else if (token.type === 'container_v-pre_close') preDepth--
      else if (token.type === 'inline' && !preDepth && token.children) {
        resolve(token.children, frontmatter)
      }
    }
  })
}

function resolve(tokens: Token[], frontmatter: Record<string, unknown>) {
  let preTag: string | undefined
  let preDepth = 0
  for (const token of tokens) {
    if (token.type === 'html_inline') {
      const [, closing, tag] = tagRE.exec(token.content) ?? []
      if (preTag) {
        if (tag === preTag) preDepth += closing ? -1 : 1
        if (!preDepth) preTag = undefined
      } else if (vPreRE.test(token.content) && !token.content.endsWith('/>')) {
        preTag = tag
        preDepth = 1
      }
    } else if (token.type === 'text' && !preTag) {
      token.content = token.content.replace(expressionRE, (match, path) => {
        let value: unknown = frontmatter
        for (const key of (path as string).slice(1).split('.')) {
          if (value == null || typeof value !== 'object') return match
          value = (value as Record<string, unknown>)[key]
        }
        // objects are for Vue's display formatting, and a value with mustaches
        // would be interpolated again by Vue if inlined here
        return value == null ||
          typeof value === 'object' ||
          (typeof value === 'string' && value.includes('{{'))
          ? match
          : String(value)
      })
    }
  }
}
