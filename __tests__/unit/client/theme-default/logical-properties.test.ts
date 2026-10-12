import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

// the default theme is laid out with logical properties so that `dir: 'rtl'`
// mirrors it without a build step; this keeps physical inline-axis
// declarations from creeping back in

const root = fileURLToPath(
  new URL('../../../../src/client/theme-default/', import.meta.url)
)

// declarations that must stay physical: centering paired with
// translate(-50%), which anchoring the inline-start edge would push
// off-centre in rtl
const physicalByDesign: Record<string, string[]> = {
  'components/VPHero.vue': ['left: 50%', 'left: 50%']
}

// a declaration starts a block, follows another declaration, or sits on its
// own line, so one-line rules are scanned like any other
const physicalInlineAxis =
  /(?<=^|[{;])\s*(?:(?:margin|padding|border|inset|scroll-margin|scroll-padding)-(?:left|right)(?:-[a-z]+)?|left|right|border-(?:top|bottom)-(?:left|right)-radius)\s*:[^;}]*|(?<=^|[{;])\s*(?:text-align|float|clear)\s*:\s*(?:left|right)\b|(?<=^|[{;])\s*(?:background-position(?:-x)?|(?:-webkit-)?mask-position|object-position|transform-origin|perspective-origin)\s*:[^;}]*\b(?:left|right)\b/gm

// shorthands set the two inline sides independently; they are physical
// whenever those values differ (values with function calls are skipped)
const shorthand =
  /(?<=^|[{;])\s*(?:(margin|padding|inset)[ \t]*:(?![^;}]*\()[ \t]*([^\s;{}!]+)[ \t]+([^\s;{}!]+)[ \t]+([^\s;{}!]+)[ \t]+([^\s;{}!]+)|(border-radius)[ \t]*:(?![^;}]*\()[ \t]*([^\s;{}!]+)[ \t]+([^\s;{}!]+)(?:[ \t]+([^\s;{}!]+))?(?:[ \t]+([^\s;{}!]+))?)[ \t]*(?:!important)?[ \t]*(?=[;}])/gm

function styles(file: string): string {
  const source = readFileSync(root + file, 'utf8')
  if (file.endsWith('.css')) return source
  return Array.from(
    source.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g),
    (m) => m[1]
  ).join('\n')
}

function physicalDeclarations(css: string): string[] {
  const found = Array.from(css.matchAll(physicalInlineAxis), (m) => m[0].trim())
  for (const m of css.matchAll(shorthand)) {
    const decl = m[0].trim()
    if (m[1]) {
      // top right bottom left
      if (m[3] !== m[5]) found.push(decl)
    } else {
      // top-left top-right bottom-right bottom-left, expanded from the
      // two- and three-value forms
      const [tl, tr, br, bl] =
        m[10] !== undefined
          ? [m[7], m[8], m[9], m[10]]
          : m[9] !== undefined
            ? [m[7], m[8], m[9], m[8]]
            : [m[7], m[8], m[7], m[8]]
      if (tl !== tr || br !== bl) found.push(decl)
    }
  }
  return found
}

describe('client/theme-default/logical-properties', () => {
  const files = readdirSync(root, { recursive: true, encoding: 'utf8' })
    .map((file) => file.replaceAll('\\', '/'))
    .filter((file) => /\.(vue|css)$/.test(file))
    .sort()

  test('every allowlisted file still exists', () => {
    expect(
      Object.keys(physicalByDesign).filter((file) => !files.includes(file))
    ).toEqual([])
  })

  test.each(files)('%s uses no physical inline-axis properties', (file) => {
    const found = physicalDeclarations(styles(file))
    const allowed = [...(physicalByDesign[file] ?? [])]
    const unexpected = found.filter((decl) => {
      const i = allowed.indexOf(decl)
      if (i === -1) return true
      allowed.splice(i, 1)
      return false
    })
    expect(unexpected).toEqual([])
    expect(allowed).toEqual([])
  })
})
