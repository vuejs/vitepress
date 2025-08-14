import { postcssIsolateStyles } from 'node/postcss/isolateStyles'
import postcss from 'postcss'

const INPUT_CSS = `
/* simple classes */
.example { color: red; }
.class-a { color: coral; }
.class-b { color: deepskyblue; }

/* escaped colon in class */
.baz\\:not\\(.bar\\) { display: block; }
.disabled\\:opacity-50:disabled { opacity: .5; }

/* pseudos (class + element) */
.button:hover { color: pink; }
.button:focus:hover { color: hotpink; }
.item::before { content: '•'; }
::first-letter { color: pink; }
::before { content: ''; }

/* universal + :not */
* { background-color: red; }
*:not(.b) { text-transform: uppercase; }

/* combinators */
.foo:hover .bar { background: blue; }
ul > li.active { color: green; }
a + b ~ c { color: orange; }

/* ids + attribute selectors */
#wow { color: yellow; }
[data-world] .d { padding: 10px 20px; }

/* :root and chained tags */
:root { --bs-blue: #0d6efd; }
:root .a { --bs-green: #bada55; }
html { margin: 0; }
body { padding: 0; }
html body div { color: blue; }

/* grouping with commas */
.a, .b { color: red; }

/* multiple repeated groups to ensure stability */
.a, .b { color: coral; }
.a { animation: glow 1s linear infinite alternate; }

/* nested blocks */
.foo {
  svg { display: none; }
  .bar { display: inline; }
}

/* standalone pseudos */
:first-child { color: pink; }
:hover { color: blue; }
:active { color: red; }

/* keyframes (should be ignored) */
@keyframes fade {
  from { opacity: 0; }
  to { opacity: 1; }
}
@-webkit-keyframes glow {
  from { color: coral; }
  to { color: red; }
}
@-moz-keyframes glow {
  from { color: coral; }
  to { color: red; }
}
@-o-keyframes glow {
  from { color: coral; }
  to { color: red; }
}
`

describe('node/postcss/isolateStyles', () => {
  test('transforms selectors and skips keyframes', () => {
    const out = run(INPUT_CSS)
    expect(out.css).toMatchSnapshot()
  })

  test('idempotent (running twice produces identical CSS)', () => {
    const first = run(INPUT_CSS).css
    const second = run(first).css
    expect(second).toBe(first)
  })
})

function run(css: string, from = 'src/styles/vp-doc.css') {
  return postcss([postcssIsolateStyles()]).process(css, { from })
}
