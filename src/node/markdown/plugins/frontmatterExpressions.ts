import type { MarkdownItAsync } from 'markdown-it-async'
import type StateCore from 'markdown-it/lib/rules_core/state_core.mjs'
import type Token from 'markdown-it/lib/token.mjs'

import type { MarkdownEnv } from '../../shared'

// matches an interpolation the way Vue's template parser does: from `{{` up
// to the nearest `}}`
const interpolationRE = /\{\{([^]+?)\}\}/g

// the same inside a link destination - markdown-it percent-encodes
// destinations while tokenizing, so the delimiters may appear encoded
const destInterpolationRE = /(?:\{\{|%7B%7B)([^]*?)(?:\}\}|%7D%7D)/gi

// a statically resolvable path after `$frontmatter`: any number of `.key`,
// `[<index>]`, `['<key>']` or `["<key>"]` segments. Leading-zero indices and
// string escapes are excluded - the runtime handles those. Keep both
// expressions in sync.
const pathRE =
  /^(?:\s*(?:\.\s*[A-Za-z_$][\w$]*|\[\s*(?:0|[1-9]\d*|'[^'\\]*'|"[^"\\]*")\s*\]))*$/
const segmentRE =
  /\.\s*([A-Za-z_$][\w$]*)|\[\s*(?:(0|[1-9]\d*)|'([^'\\]*)'|"([^"\\]*)")\s*\]/g

// an opening html tag carrying `v-pre`, e.g. `<span v-pre>`, and the tag
// name of any html tag, for tracking where that scope ends
const vPreOpenRE = /^<[A-Za-z][\w-]*\s[^>]*(?<=\s)v-pre(?=[\s=/>])/
const htmlTagRE = /^<(\/?)([A-Za-z][\w-]*)/
const vPreRE = /\bv-pre\b/

type Resolve = (expr: string) => string | undefined

export const frontmatterExpressionsPlugin = (md: MarkdownItAsync) => {
  // before the rules other plugins push (anchor, toc, ...), so slugs and
  // extracted titles are derived from the resolved text
  md.core.ruler.after('text_join', 'vp_frontmatter_expressions', (state) =>
    frontmatterExpressions(md, state)
  )

  // resolved values render with their own escaping (see `escapeValue`);
  // everything else keeps the existing text rule
  const textRule = md.renderer.rules.text!
  md.renderer.rules.text = (tokens, idx, options, env, self) =>
    tokens[idx].meta?.frontmatterValue
      ? escapeValue(tokens[idx].content)
      : textRule(tokens, idx, options, env, self)
}

function frontmatterExpressions(md: MarkdownItAsync, state: StateCore): void {
  const { frontmatter } = state.env as MarkdownEnv
  if (!frontmatter || !state.src.includes('{{')) return

  // the runtime `$frontmatter` is the frontmatter after the JSON round-trip
  // into `__pageData` (see `injectPageDataCode`), so resolve against the
  // same view of the data - dates become ISO strings and non-JSON values
  // are dropped
  let data: unknown
  let failed = false
  const resolve: Resolve = (rawExpr) => {
    const expr = rawExpr.trim()
    if (!expr.startsWith('$frontmatter')) return undefined
    const path = expr.slice('$frontmatter'.length)
    if (!pathRE.test(path)) return undefined

    if (data === undefined && !failed) {
      try {
        data = JSON.parse(JSON.stringify(frontmatter))
      } catch {
        failed = true
      }
    }
    if (failed) return undefined

    let value = data
    for (const m of path.matchAll(segmentRE)) {
      const key = (m[1] ?? m[2] ?? m[3] ?? m[4])!
      // a missing key may still be provided by `transformPageData`, and a
      // path through a non-object would throw at runtime - leave both alone
      if (
        value === null ||
        typeof value !== 'object' ||
        !Object.hasOwn(value, key)
      ) {
        return undefined
      }
      value = (value as Record<string, unknown>)[key]
    }
    return display(value)
  }

  let skipLevel: number | null = null
  for (const token of state.tokens) {
    if (skipLevel !== null) {
      if (token.nesting === -1 && token.level === skipLevel) skipLevel = null
    } else if (token.type === 'html_block') {
      // a raw html block can open a `v-pre` scope spanning the markdown
      // after it; that cannot be delimited without parsing the html, so
      // leave the rest of the page to the runtime
      if (vPreRE.test(token.content)) return
    } else if (
      token.nesting === 1 &&
      (token.type === 'container_v-pre_open' || hasVPre(token))
    ) {
      skipLevel = token.level
    } else if (token.type === 'inline' && token.children) {
      processInline(md, state, token, resolve)
    }
  }
}

function processInline(
  md: MarkdownItAsync,
  state: StateCore,
  inline: Token,
  resolve: Resolve
): void {
  const children = inline.children!

  let out: Token[] | undefined
  let skipLevel: number | null = null
  let preTag: string | undefined
  let preDepth = 0

  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    let replacement: Token[] | undefined
    if (skipLevel !== null) {
      if (child.nesting === -1 && child.level === skipLevel) skipLevel = null
    } else if (child.type === 'html_inline') {
      // track raw inline `v-pre` elements the way Vue scopes them
      const [, closing, tag] = htmlTagRE.exec(child.content) ?? []
      if (preTag) {
        if (tag === preTag) preDepth += closing ? -1 : 1
        if (!preDepth) preTag = undefined
      } else if (
        vPreOpenRE.test(child.content) &&
        !child.content.endsWith('/>')
      ) {
        preTag = tag
        preDepth = 1
      }
    } else if (preTag) {
      // inside a raw v-pre element - leave everything to the runtime
    } else if (child.nesting === 1 && hasVPre(child)) {
      skipLevel = child.level
    } else if (child.type === 'text' && child.content.includes('{{')) {
      replacement = replaceInterpolations(state, child, resolve)
    } else if (child.type === 'link_open' || child.type === 'image') {
      resolveDest(md, child, child.type === 'image' ? 'src' : 'href', resolve)
    }
    if (replacement && !out) out = children.slice(0, i)
    if (out) out.push(...(replacement ?? [child]))
  }
  if (out) inline.children = out
}

// splits a text token around its resolved interpolations; the values become
// text tokens marked as `frontmatterValue` so extraction (anchors, headers,
// toc, search) sees them as plain text while the renderer applies value
// escaping
function replaceInterpolations(
  state: StateCore,
  token: Token,
  resolve: Resolve
): Token[] | undefined {
  const src = token.content
  let out: Token[] | undefined
  let lastIndex = 0

  for (const m of src.matchAll(interpolationRE)) {
    const value = resolve(m[1])
    if (value === undefined) continue
    out ??= []
    if (m.index > lastIndex) {
      out.push(textToken(state, token, src.slice(lastIndex, m.index)))
    }
    const valueToken = textToken(state, token, value)
    valueToken.meta = { frontmatterValue: true }
    out.push(valueToken)
    lastIndex = m.index + m[0].length
  }

  if (out && lastIndex < src.length) {
    out.push(textToken(state, token, src.slice(lastIndex)))
  }
  return out
}

// resolves interpolations in a link href or image src, making
// `[text]({{$frontmatter.link}})` a real link (#2240, #2099); the resolved
// destination goes through the same normalization and validation a literal
// one would
function resolveDest(
  md: MarkdownItAsync,
  token: Token,
  attr: string,
  resolve: Resolve
): void {
  const url = token.attrGet(attr)
  if (!url) return

  let changed = false
  const resolved = url.replace(destInterpolationRE, (match, rawExpr) => {
    let expr = rawExpr as string
    try {
      expr = decodeURIComponent(expr)
    } catch {}
    const value = resolve(expr)
    if (value === undefined) return match
    changed = true
    return value
  })
  if (!changed) return

  const normalized = md.normalizeLink(resolved)
  if (md.validateLink(normalized)) token.attrSet(attr, normalized)
}

function textToken(state: StateCore, from: Token, content: string): Token {
  const token = new state.Token('text', '', 0)
  token.content = content
  token.level = from.level
  return token
}

// whitespace the Vue template compiler's default `condense` mode would not
// read back verbatim: any [\t\n\r\f], runs of spaces, or edge spaces that
// could merge with adjacent whitespace
const unstableWhitespaceRE = /[\t\n\r\f]|^ | $| {2}/

// mirrors Vue's `toDisplayString`, restricted to values that inline
// losslessly: non-empty primitive text that survives the template
// compiler's whitespace condensing. Anything else - including `null`, which
// renders as an empty string but is also the classic "filled in later by
// `transformPageData`" placeholder - stays on the runtime.
function display(value: unknown): string | undefined {
  if (value == null || typeof value === 'object') return undefined
  const text = typeof value === 'string' ? value : String(value)
  return text === '' || unstableWhitespaceRE.test(text) ? undefined : text
}

// entity-encode the value so the Vue template compiler reads back exactly
// this text: html syntax must not be parsed as markup, entity look-alikes
// must survive the compiler's decoding, and `{` must never reach the
// compiler as a possible interpolation start
function escapeValue(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\{/g, '&#123;')
    .replace(/\}/g, '&#125;')
}

function hasVPre(token: Token): boolean {
  return token.attrGet('v-pre') !== null
}
