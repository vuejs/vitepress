import type { MarkdownItAsync } from 'markdown-it-async'
import type MarkdownIt from 'markdown-it'
import type StateCore from 'markdown-it/lib/rules_core/state_core.mjs'
import type Token from 'markdown-it/lib/token.mjs'

import type { MarkdownEnv, MarkdownSourceLoc } from '../../shared'

// consumed source range of an inline token, [start, end) offsets into the
// inline parser's src. Symbols ride on the token objects themselves, so they
// survive plugins that splice children arrays or mutate `inline.content`
// (attrs, emoji, tasklist, github alerts) — index- or content-based
// reconstruction would not.
const RANGE = Symbol('vpRange')
// line-relative position, precomputed while the pristine inline src is still
// available (later core rules mutate token content)
const POS = Symbol('vpPos')
const INSTALLED = Symbol('vpPositionsInstalled')

interface InlinePos {
  /** line breaks in the inline src before the range start */
  dLine: number
  /** offset within that inline-src line; -1 when only the line is known */
  startInLine: number
  /** that inline-src line's text, for column re-alignment against the raw source */
  lineText: string
}

type PositionedToken = Token & {
  [RANGE]?: [number, number]
  [POS]?: InlinePos
}

/**
 * Tracks exact source positions for links and images. markdown-it only maps
 * block-level tokens to lines, so on its own every link in a multi-line
 * paragraph reports the paragraph's first line, and table-cell links (whose
 * inline tokens carry no map at all) report nothing.
 *
 * Mechanism: every inline rule is wrapped (lazily, on first parse, so rules
 * registered by user `config` hooks are covered too) to record the source
 * range it consumed onto the tokens it emitted. A final core rule converts
 * ranges into `{file, line, column}` via the parent inline token's map and
 * `env.lineMap`, and stamps the result as `token.meta.vpLoc` on `link_open`
 * and `image` tokens, along with the decoded pre-normalization destination
 * as `token.meta.vpRaw`.
 */
export function sourcePositionsPlugin(md: MarkdownItAsync): void {
  md.core.ruler.before('normalize', 'vp_inline_positions', (state) => {
    const inline = state.md.inline as unknown as Record<symbol, boolean>
    if (!inline[INSTALLED]) {
      inline[INSTALLED] = true
      installInlineWrappers(state.md)
      installParseWrapper(state.md)
    }
  })

  // markdown-it's table rule leaves cell inline tokens without a map; the
  // enclosing row token has one, so cells inherit their exact row line
  md.core.ruler.after('block', 'vp_table_cell_maps', (state) => {
    let rowMap: [number, number] | null = null
    for (const token of state.tokens) {
      if (token.type === 'tr_open') rowMap = token.map
      else if (token.type === 'tr_close') rowMap = null
      else if (rowMap && token.type === 'inline' && !token.map)
        token.map = [rowMap[0], rowMap[1]]
    }
  })

  // the linkify *core* rule splices brand-new link tokens into children after
  // inline parsing; they carry no range, so recover at least the line from
  // the break tokens before them
  md.core.ruler.after('linkify', 'vp_linkify_positions', (state) => {
    if (!state.md.options.linkify) return
    for (const token of state.tokens) {
      if (token.type !== 'inline' || !token.children) continue
      let breaks = 0
      for (const child of token.children as PositionedToken[]) {
        if (
          child.type === 'link_open' &&
          child.markup === 'linkify' &&
          !child[RANGE]
        ) {
          child[POS] = { dLine: breaks, startInLine: -1, lineText: '' }
        } else if (child.type === 'softbreak' || child.type === 'hardbreak') {
          breaks++
        } else if (child.content) {
          breaks += countLineBreaks(child.content)
        }
      }
    }
  })

  md.core.ruler.push('vp_source_locs', sourceLocs)
}

function installInlineWrappers(md: MarkdownIt): void {
  interface RuleEntry {
    name: string
    enabled: boolean
    fn: ((state: any, silent: boolean) => boolean) & { [INSTALLED]?: boolean }
    alt: string[]
  }
  const ruler = md.inline.ruler as unknown as { __rules__: RuleEntry[] }

  for (const rule of [...ruler.__rules__]) {
    const orig = rule.fn
    if (orig[INSTALLED]) continue
    const name = rule.name

    const wrapped = (state: any, silent: boolean): boolean => {
      if (silent) return orig(state, silent)

      const startIdx: number = state.tokens.length
      // state.push() flushes pending text first, so the first token a rule
      // appears to emit is often the text run *before* the construct — it
      // must not receive this rule's range (the gap-fill pass owns it)
      const hadPending: boolean = state.pending.length > 0
      let start: number = state.pos
      if (!orig(state, false)) return false

      // the linkify inline rule is entered at the "://", with the scheme
      // already consumed into pending — back-scan to recover it
      if (name === 'linkify') {
        while (start > 0 && /[a-z0-9.+-]/i.test(state.src[start - 1])) start--
      }

      const end: number = state.pos
      for (let i = startIdx; i < state.tokens.length; i++) {
        const token = state.tokens[i] as PositionedToken
        // nested tokenization (link labels) has already stamped inner tokens
        // with more precise ranges
        if (token[RANGE]) continue
        if (i === startIdx && hadPending && token.type === 'text') continue
        token[RANGE] = [start, end]
      }
      return true
    }
    wrapped[INSTALLED] = true

    md.inline.ruler.at(name, wrapped, { alt: rule.alt })
  }
}

function installParseWrapper(md: MarkdownIt): void {
  const inline = md.inline
  const parse = inline.parse.bind(inline)

  inline.parse = (src, mdIt, env, outTokens: PositionedToken[]) => {
    parse(src, mdIt, env, outTokens)

    // gap-fill: text runs flushed from pending have no range; they span from
    // the previous stamped range to the next one. Runs after ruler2, so
    // emphasis retyping and fragment joining are already done.
    let prevEnd = 0
    for (let i = 0; i < outTokens.length; i++) {
      let range = outTokens[i][RANGE]
      if (!range) {
        let next = src.length
        for (let j = i + 1; j < outTokens.length; j++) {
          const r = outTokens[j][RANGE]
          if (r) {
            next = r[0]
            break
          }
        }
        range = outTokens[i][RANGE] = [prevEnd, next]
      }
      prevEnd = range[1]
    }

    // precompute line-relative positions for the tokens we resolve later,
    // while src is still pristine (core rules mutate token content)
    let lineStarts: number[] | undefined
    for (const token of outTokens) {
      if (token.type !== 'link_open' && token.type !== 'image') continue
      const range = token[RANGE]
      if (!range) continue
      lineStarts ??= makeLineStarts(src)
      const line = findLine(lineStarts, range[0])
      const lineStart = lineStarts[line]
      const lineEnd =
        line + 1 < lineStarts.length ? lineStarts[line + 1] - 1 : src.length
      token[POS] = {
        dLine: line,
        startInLine: range[0] - lineStart,
        lineText: src.slice(lineStart, lineEnd)
      }
    }
  }
}

function sourceLocs(state: StateCore): void {
  const env = state.env as MarkdownEnv
  let srcLineStarts: number[] | undefined

  for (const token of state.tokens) {
    if (token.type !== 'inline' || !token.children || !token.map) continue

    for (const child of token.children as PositionedToken[]) {
      const isImage = child.type === 'image'
      if (child.type !== 'link_open' && !isImage) continue

      // no captured position means the token was injected synthetically by a
      // core rule (e.g. anchor permalinks) — fabricating a location for it
      // would be worse than none
      const pos = child[POS]
      if (!pos) continue

      const line = token.map[0] + pos.dLine
      const resolved = env.lineMap?.resolve(line)
      const loc: MarkdownSourceLoc = resolved
        ? { file: resolved.file, line: resolved.line + 1 }
        : { file: env.realPath ?? env.path, line: line + 1 }

      // block parsing only ever strips a prefix per line, so the inline line
      // is a suffix of the raw source line; re-align to get the true column.
      // A spliced line is stitched from more than one source, so no column
      // on it is meaningful in any single file.
      if (pos.startInLine >= 0 && !resolved?.spliced) {
        srcLineStarts ??= makeLineStarts(state.src)
        const raw = getLine(state.src, srcLineStarts, line)
        if (raw !== undefined) {
          if (raw.endsWith(pos.lineText)) {
            loc.column = raw.length - pos.lineText.length + pos.startInLine + 1
          } else {
            // over-indented content gets spaces prepended instead — fall
            // back to searching, and omit the column on ambiguity
            const at = raw.indexOf(pos.lineText)
            if (at >= 0) loc.column = at + pos.startInLine + 1
          }
        }
      }

      child.meta ??= {}
      child.meta.vpLoc = loc
      // the destination as authored (before rebasing and href normalization
      // mutate the attr at render time), for dead-link reporting
      const dest = child.attrGet(isImage ? 'src' : 'href')
      if (dest != null) child.meta.vpRaw = safeDecodeURI(dest)
    }
  }
}

function safeDecodeURI(str: string): string {
  try {
    return decodeURI(str)
  } catch {
    return str
  }
}

function countLineBreaks(str: string): number {
  let n = 0
  let i = str.indexOf('\n')
  while (i !== -1) {
    n++
    i = str.indexOf('\n', i + 1)
  }
  return n
}

function makeLineStarts(src: string): number[] {
  const starts = [0]
  let i = src.indexOf('\n')
  while (i !== -1) {
    starts.push(i + 1)
    i = src.indexOf('\n', i + 1)
  }
  return starts
}

/** index of the line containing `offset`, given sorted line-start offsets */
function findLine(lineStarts: number[], offset: number): number {
  let lo = 0
  let hi = lineStarts.length
  while (lo < hi) {
    const mid = (lo + hi) >>> 1
    if (lineStarts[mid] <= offset) lo = mid + 1
    else hi = mid
  }
  return Math.max(0, lo - 1)
}

function getLine(
  src: string,
  lineStarts: number[],
  line: number
): string | undefined {
  if (line < 0 || line >= lineStarts.length) return undefined
  const start = lineStarts[line]
  const end =
    line + 1 < lineStarts.length ? lineStarts[line + 1] - 1 : src.length
  return src.slice(start, end)
}
