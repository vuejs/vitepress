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

// page-level gate for either spelling
const anyInterpolationRE = /\{\{|%7B%7B/i

// a statically resolvable path after `$frontmatter`: any number of `.key`,
// `[<index>]`, `['<key>']` or `["<key>"]` segments. Leading-zero indices and
// string escapes are excluded - the runtime handles those. Keep both
// expressions in sync.
const pathRE =
  /^(?:\s*(?:\.\s*[A-Za-z_$][\w$]*|\[\s*(?:0|[1-9]\d*|'[^'\\]*'|"[^"\\]*")\s*\]))*$/
const segmentRE =
  /\.\s*([A-Za-z_$][\w$]*)|\[\s*(?:(0|[1-9]\d*)|'([^'\\]*)'|"([^"\\]*)")\s*\]/g

// one raw html tag: closing slash, name, attributes (a quoted value may
// contain `>`), self-closing slash
const htmlTagRE = /<(\/?)([A-Za-z][\w-]*)((?:[^"'>]|"[^"]*"|'[^']*')*?)(\/?)>/g
const htmlCommentRE = /<!--[^]*?-->/g
// script/style/textarea/title content is raw text, not markup
const rawTextElementRE = /<(script|style|textarea|title)\b[^]*?<\/\1\s*>/gi
const vPreAttrRE = /(?:^|\s)v-pre(?=[\s=/]|$)/
// void elements never take a closing tag, so v-pre on them opens no scope
const voidTagRE =
  /^(?:area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/

type Resolve = (expr: string) => string | undefined

interface EagerInterpolation {
  expression: string
  value: string
}

interface VPreScope {
  tag: string
  depth: number
}

export const eagerFrontmatterInterpolationPlugin = (md: MarkdownItAsync) => {
  // the main rule is anchored right after `text_join`, before the rules
  // other plugins push (anchor, title, ...), so slugs and extracted titles
  // are derived from the resolved text
  md.core.ruler.after(
    'text_join',
    'vp_eager_frontmatter_interpolation',
    eagerFrontmatterInterpolation
  )

  // the finalize rule is pushed when this plugin is applied - which must be
  // after anchor/title so it runs once their rules have read the plain text
  md.core.ruler.push('vp_eager_frontmatter_finalize', finalize)

  // resolved values render with their own escaping (see `escapeValue`);
  // everything else keeps the existing text rule
  const textRule = md.renderer.rules.text!
  md.renderer.rules.text = (tokens, idx, options, env, self) =>
    tokens[idx].meta?.frontmatterValue
      ? escapeValue(tokens[idx].content)
      : textRule(tokens, idx, options, env, self)
}

export function findStaleEagerInterpolations(
  interpolations: EagerInterpolation[],
  frontmatter: Record<string, unknown>
): string[] {
  const resolve = createResolver(frontmatter)
  const stale = interpolations
    .filter(({ expression, value }) => resolve(expression) !== value)
    .map(({ expression }) => expression)
  return [...new Set(stale)]
}

function eagerFrontmatterInterpolation(state: StateCore): void {
  const { frontmatter } = state.env as MarkdownEnv
  if (!frontmatter || !anyInterpolationRE.test(state.src)) return

  const resolve = createResolver(frontmatter)

  // an unclosed v-pre element opened by a raw html block scopes over the
  // markdown after it until later raw html closes it
  let blockScope: VPreScope | undefined
  let skipLevel: number | null = null
  for (const token of state.tokens) {
    if (token.type === 'html_block') {
      blockScope = scanRawHtml(token.content, blockScope)
      continue
    }
    if (skipLevel !== null) {
      if (token.nesting === -1 && token.level === skipLevel) skipLevel = null
      continue
    }
    if (
      token.nesting === 1 &&
      (token.type === 'container_v-pre_open' || hasVPre(token))
    ) {
      skipLevel = token.level
      continue
    }
    if (token.type !== 'inline' || !token.children) continue
    if (blockScope) {
      // a stray closing tag inside a paragraph still ends the scope, but the
      // paragraph itself stays with the runtime
      for (const child of token.children) {
        if (child.type === 'html_inline')
          blockScope = scanRawHtml(child.content, blockScope)
      }
      continue
    }
    processInline(state, token, resolve)
  }
}

// after anchor ids and the page title have been extracted from the plain
// text, retype values the shared `text` renderer rule - which user config
// may replace - could not safely emit: braces would compile as
// interpolations and entity look-alikes would decode. `html_inline` renders
// its content verbatim, so these carry their own escaping.
const unsafeAsTextRE = /[{}]|&[\w#]+;/
function finalize(state: StateCore): void {
  if (!(state.env as MarkdownEnv).eagerInterpolations?.length) return
  for (const token of state.tokens) {
    if (token.type !== 'inline' || !token.children) continue
    for (const child of token.children) {
      if (child.meta?.frontmatterValue && unsafeAsTextRE.test(child.content)) {
        child.type = 'html_inline'
        child.content = escapeValue(child.content)
      }
    }
  }
}

function createResolver(frontmatter: Record<string, unknown>): Resolve {
  // the runtime `$frontmatter` is the frontmatter after the JSON round-trip
  // into `__pageData` (see `injectPageDataCode`), so resolve against the
  // same view of the data - dates become ISO strings and non-JSON values
  // are dropped
  let data: unknown
  let failed = false
  return (rawExpr) => {
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
}

// scans a chunk of raw html, entering and leaving `v-pre` element scopes the
// way Vue's parser would: quoted attribute values may contain `>`, tag names
// match case-insensitively, self-closing and void tags open no scope, and
// comments and raw-text elements (script/style/...) are not markup
function scanRawHtml(
  html: string,
  scope: VPreScope | undefined
): VPreScope | undefined {
  const src = html.replace(htmlCommentRE, '').replace(rawTextElementRE, '')
  htmlTagRE.lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = htmlTagRE.exec(src))) {
    const [, closing, rawTag, attrs, selfClosing] = m
    const tag = rawTag.toLowerCase()
    if (scope) {
      if (tag === scope.tag && !selfClosing) {
        scope.depth += closing ? -1 : 1
        if (!scope.depth) scope = undefined
      }
    } else if (
      !closing &&
      !selfClosing &&
      !voidTagRE.test(tag) &&
      vPreAttrRE.test(attrs)
    ) {
      scope = { tag, depth: 1 }
    }
  }
  return scope
}

function processInline(
  state: StateCore,
  inline: Token,
  resolve: Resolve
): void {
  const children = inline.children!

  let out: Token[] | undefined
  let skipLevel: number | null = null
  // scopes opened by raw inline tags end with the paragraph - Vue closes
  // unclosed inline elements at the enclosing block's end tag
  let scope: VPreScope | undefined

  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    let replacement: Token[] | undefined
    if (child.type === 'html_inline') {
      scope = scanRawHtml(child.content, scope)
    } else if (scope) {
      // inside a raw v-pre element - leave everything to the runtime
    } else if (skipLevel !== null) {
      if (child.nesting === -1 && child.level === skipLevel) skipLevel = null
    } else if (child.nesting === 1 && hasVPre(child)) {
      skipLevel = child.level
    } else if (child.type === 'text' && child.content.includes('{{')) {
      replacement = replaceInterpolations(state, children, i, resolve)
    } else if (child.type === 'link_open' || child.type === 'image') {
      resolveDest(
        state,
        child,
        child.type === 'image' ? 'src' : 'href',
        resolve
      )
    }
    if (replacement && !out) out = children.slice(0, i)
    if (out) out.push(...(replacement ?? [child]))
  }
  if (out) inline.children = out
}

// how the neighbor beyond any whitespace looks from a text token: entering a
// raw inline element, leaving one, or neither
function rawTagBoundary(
  children: Token[],
  i: number,
  dir: -1 | 1
): { kind: 'open' | 'close' | null; sawBreak: boolean } {
  let sawBreak = false
  for (let j = i + dir; j >= 0 && j < children.length; j += dir) {
    const t = children[j]
    if (t.type === 'softbreak') {
      sawBreak = true
      continue
    }
    if (t.type !== 'html_inline') break
    htmlTagRE.lastIndex = 0
    const m = htmlTagRE.exec(t.content)
    if (!m) break
    const [, closing, tag, , selfClosing] = m
    if (selfClosing || voidTagRE.test(tag.toLowerCase())) break
    return { kind: closing ? 'close' : 'open', sawBreak }
  }
  return { kind: null, sawBreak }
}

// splits a text token around its resolved interpolations; the values become
// text tokens marked as `frontmatterValue` so extraction (anchors, headers,
// toc, search) sees them as plain text while the renderer applies value
// escaping
function replaceInterpolations(
  state: StateCore,
  children: Token[],
  index: number,
  resolve: Resolve
): Token[] | undefined {
  const token = children[index]
  const src = token.content
  const left = rawTagBoundary(children, index, -1)
  const right = rawTagBoundary(children, index, 1)
  let out: Token[] | undefined
  let lastIndex = 0

  for (const m of src.matchAll(interpolationRE)) {
    const value = resolve(m[1])
    if (value === undefined) continue
    // an inlined value merges with adjacent whitespace into one text node,
    // which Vue's whitespace condensing keeps - while the runtime's
    // whitespace-only text nodes at raw inline element edges are removed.
    // `<code> {{ x }} </code>` must stay with the runtime to render the same.
    const before = src.slice(0, m.index)
    const after = src.slice(m.index + m[0].length)
    if (
      (left.kind === 'open' &&
        !before.trim() &&
        (before !== '' || left.sawBreak)) ||
      (right.kind === 'close' &&
        !after.trim() &&
        (after !== '' || right.sawBreak))
    ) {
      continue
    }
    out ??= []
    if (m.index > lastIndex) {
      out.push(textToken(state, token, src.slice(lastIndex, m.index)))
    }
    const valueToken = textToken(state, token, value)
    valueToken.meta = { frontmatterValue: true }
    out.push(valueToken)
    record(state, m[1], value)
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
  state: StateCore,
  token: Token,
  attr: string,
  resolve: Resolve
): void {
  const url = token.attrGet(attr)
  if (!url) return

  const resolved: EagerInterpolation[] = []
  const next = url.replace(destInterpolationRE, (match, rawExpr) => {
    let expr = rawExpr as string
    try {
      expr = decodeURIComponent(expr)
    } catch {}
    const value = resolve(expr)
    if (value === undefined) return match
    resolved.push({ expression: expr, value })
    return value
  })
  if (!resolved.length) return

  const normalized = state.md.normalizeLink(next)
  if (!state.md.validateLink(normalized)) return
  token.attrSet(attr, normalized)
  // the value belongs to the page whose frontmatter it came from - the
  // include plugin must not rebase it against an included file's directory
  token.meta = { ...token.meta, frontmatterDest: true }
  for (const r of resolved) record(state, r.expression, r.value)
}

function record(state: StateCore, expression: string, value: string): void {
  const env = state.env as MarkdownEnv
  ;(env.eagerInterpolations ??= []).push({
    expression: expression.trim(),
    value
  })
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
// compiler's whitespace condensing and cannot smuggle markup into extracted
// titles and headers. Anything else - including `null`, which renders as an
// empty string but is also the classic "filled in later by
// `transformPageData`" placeholder - stays on the runtime.
function display(value: unknown): string | undefined {
  if (value == null || typeof value === 'object') return undefined
  const text = typeof value === 'string' ? value : String(value)
  return text === '' || text.includes('<') || unstableWhitespaceRE.test(text)
    ? undefined
    : text
}

// entity-encode the value so the Vue template compiler reads back exactly
// this text: `{` must never reach the compiler as a possible interpolation
// start, and entity look-alikes must survive the compiler's decoding. `&` is
// encoded numerically so downstream passes that undo `&amp;`
// double-encoding (the toc `format` hook) leave it alone.
function escapeValue(value: string): string {
  return value
    .replace(/&/g, '&#38;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\{/g, '&#123;')
    .replace(/\}/g, '&#125;')
}

function hasVPre(token: Token): boolean {
  return token.attrGet('v-pre') !== null
}
