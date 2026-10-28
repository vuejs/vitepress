import {
  injectStaticMarkers,
  removeStaticMarkers,
  stripStaticContent
} from 'node/utils/leanChunk'

// html arguments as rolldown prints them in renderChunk: json-escaped double
// quoted literals (single quotes kept for safety), joined with `+` around a
// hoisted asset import or around one the bundler inlined
const escaped = String.raw`"<p id=\"a\">one \\ two\nthree</p>"`
const single = String.raw`'<p id="b">four</p>'`
const joined = String.raw`"<img src=\"" + _imports_0 + "\" alt=\"c\">" + "<p>five</p>"`

const call = (html: string, count = 1) => `createStaticVNode(${html}, ${count})`
const marked = (html: string) =>
  `${html[0]}__VP_STATIC_START__${html.slice(1, -1)}__VP_STATIC_END__${html.slice(-1)}`

describe('node/utils/leanChunk', () => {
  test('marks each call on its own when several share a line (#5553)', () => {
    const line = `[a(${call(escaped)}, x), b(${call(single, 2)}, y)]`

    expect(injectStaticMarkers(line)).toBe(
      `[a(${call(marked(escaped))}, x), b(${call(marked(single), 2)}, y)]`
    )
    expect(stripStaticContent(injectStaticMarkers(line))).toBe(
      `[a(${call('""')}, x), b(${call('""', 2)}, y)]`
    )
  })

  test('spans html joined around asset imports', () => {
    const code = `f(${call(joined, 3)})`

    expect(injectStaticMarkers(code)).toBe(`f(${call(marked(joined), 3)})`)
    expect(stripStaticContent(injectStaticMarkers(code))).toBe(
      `f(${call('""', 3)})`
    )
  })

  test('leaves other calls alone', () => {
    for (const code of [
      'createStaticVNode(html, 1)',
      'createStaticVNode("a" + b, 1)',
      'createStaticVNode("a", n)',
      '_createStaticVNode("a", 1)'
    ]) {
      expect(injectStaticMarkers(code)).toBe(code)
    }
  })

  test('restores the full chunk', () => {
    const code = `${call(escaped)}\n${call(joined)}\n${call(single)}`
    expect(removeStaticMarkers(injectStaticMarkers(code))).toBe(code)
  })

  test('strips markers the minifier re-quoted or folded', () => {
    expect(
      stripStaticContent(
        't(`__VP_STATIC_START__<p>a</p>${x}__VP_STATIC_END__`,1),' +
          't("__VP_STATIC_START__<a>"+x+"</a>__VP_STATIC_END__",1),' +
          "t('__VP_STATIC_START__<b>c</b>__VP_STATIC_END__',2)"
      )
    ).toBe('t("",1),t("",1),t("",2)')
  })
})
