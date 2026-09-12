import path from 'node:path'

import type MarkdownIt from 'markdown-it'
import type { MarkdownItAsync } from 'markdown-it-async'
import type Token from 'markdown-it/lib/token.mjs'

import { slash, type MarkdownEnv } from '../../shared'

/**
 * The attribute carrying an element's source location in dev,
 * `"cwd-relative-path:line:column"` (1-based, both parts required by every
 * consumer's parser). It is the attribute `vite-plugin-vue-inspector`'s
 * overlay reads off arbitrary DOM elements — markdown content compiles into
 * static vnodes without per-element instrumentation, so the attribute is the
 * only channel — and what VitePress's own dev open-in-editor handler uses.
 */
export const SOURCE_LOC_ATTR = 'data-v-inspector'

/**
 * Stamps rendered block elements with the source location they were authored
 * at (include-aware via `env.lineMap`). Only runs for envs that opt in
 * (`env.emitSourceLoc`, set for page renders in dev) — local search
 * indexing, content loaders and builds stay byte-identical.
 *
 * Renderers that build their markup by hand (fences, code groups, GitHub
 * alerts) re-emit the attribute themselves; `html_block` is skipped since
 * raw HTML and Vue components render their content verbatim.
 */
/**
 * For renderers that build their markup by hand and would otherwise drop
 * `token.attrs`: the source-location attribute rendered as ` name="value"`,
 * or an empty string.
 */
export function renderSourceLocAttr(
  md: Pick<MarkdownIt, 'utils'>,
  token: Token
): string {
  const loc = token.attrGet(SOURCE_LOC_ATTR)
  return loc ? ` ${SOURCE_LOC_ATTR}="${md.utils.escapeHtml(loc)}"` : ''
}

/**
 * Like `renderSourceLocAttr`, but also removes the attribute from the token —
 * for wrappers whose inner renderer may fall back to a default rule that
 * renders token attrs, which would emit the location twice.
 */
export function popSourceLocAttr(
  md: Pick<MarkdownIt, 'utils'>,
  token: Token
): string {
  const rendered = renderSourceLocAttr(md, token)
  const index = token.attrIndex(SOURCE_LOC_ATTR)
  if (index >= 0) token.attrs!.splice(index, 1)
  return rendered
}

export function sourceAttrsPlugin(md: MarkdownItAsync): void {
  md.core.ruler.push('vp_source_attrs', (state) => {
    const env = state.env as MarkdownEnv
    if (!env.emitSourceLoc) return

    for (const token of state.tokens) {
      if (
        !token.map ||
        token.nesting < 0 ||
        token.hidden ||
        !token.tag ||
        token.type === 'inline' ||
        token.type === 'html_block'
      ) {
        continue
      }
      // vpLineOffset: lines a core rule removed from the block's content
      // (the github-alerts marker) while its map kept spanning them
      const mapLine = token.map[0] + (token.meta?.vpLineOffset ?? 0)
      const resolved = env.lineMap?.resolve(mapLine)
      // a spliced line is stitched from more than one source — skip rather
      // than point at the wrong file
      if (resolved?.spliced) continue
      const file = resolved ? resolved.file : (env.realPath ?? env.path)
      const line = resolved ? resolved.line : mapLine
      if (!file) continue
      token.attrSet(
        SOURCE_LOC_ATTR,
        `${slash(path.relative(process.cwd(), file))}:${line + 1}:1`
      )
    }
  })
}
