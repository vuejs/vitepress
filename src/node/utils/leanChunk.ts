// Page chunks are emitted twice: the full chunk, and a "lean" one for the
// initial load in which the html of every `createStaticVNode(...)` call is
// replaced with an empty string — it is already in the server-rendered page,
// and hydrating it only needs the node count. The html is marked in
// `renderChunk`, before minification would make it unsafe to locate, and cut
// out in `generateBundle`. Matching it with a regexp relies on the specific
// output of Vue's compiler and the bundler's printer, a reasonable trade-off
// considering the massive perf win over a full AST parse.

// a double- or single-quoted string literal, escapes included
const stringLiteral = /"(?:[^"\\\r\n]|\\.)*"|'(?:[^'\\\r\n]|\\.)*'/.source

// the html argument of `createStaticVNode`: one string literal, or several
// joined with `+` around hoisted asset imports (vue emits
// `"<img src=\"" + _imports_0 + "\">"`, and the bundler may inline such a
// constant as one more literal). Each literal is matched up to its own closing
// quote: rolldown can print several calls on one line, and running to the
// line's last quote used to swallow the code between them (#5553).
const staticHtmlRE = new RegExp(
  String.raw`\bcreateStaticVNode\(((?:${stringLiteral})(?:\s*\+\s*(?:[\w$]+\s*\+\s*)*(?:${stringLiteral}))*)\s*,\s*(\d+)\s*\)`,
  'g'
)

export const STATIC_START = '__VP_STATIC_START__'
export const STATIC_END = '__VP_STATIC_END__'

// the markers survive minification, which may re-quote or fold the literals
const staticStripRE = new RegExp(
  `['"\`]${STATIC_START}[^]*?${STATIC_END}['"\`]`,
  'g'
)
const staticRestoreRE = new RegExp(`${STATIC_START}|${STATIC_END}`, 'g')

export function injectStaticMarkers(code: string): string {
  return code.replace(
    staticHtmlRE,
    (_, html: string, count: string) =>
      `createStaticVNode(${html[0]}${STATIC_START}${html.slice(1, -1)}${STATIC_END}${html.slice(-1)}, ${count})`
  )
}

export function stripStaticContent(code: string): string {
  return code.replace(staticStripRE, '""')
}

export function removeStaticMarkers(code: string): string {
  return code.replace(staticRestoreRE, '')
}
