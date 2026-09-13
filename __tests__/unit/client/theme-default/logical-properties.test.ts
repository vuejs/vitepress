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

const physicalInlineAxis =
  /^\s*(?:(?:margin|padding|border|inset|scroll-margin|scroll-padding)-(?:left|right)(?:-[a-z]+)?|left|right|border-(?:top|bottom)-(?:left|right)-radius)\s*:[^;]*|^\s*(?:text-align|float|clear)\s*:\s*(?:left|right)\b|^\s*(?:background|object|mask|transform)-(?:position|origin)\s*:[^;]*\b(?:left|right)\b/gm

function styles(file: string): string {
  const source = readFileSync(root + file, 'utf8')
  if (file.endsWith('.css')) return source
  return Array.from(
    source.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g),
    (m) => m[1]
  ).join('\n')
}

describe('client/theme-default/logical-properties', () => {
  const files = readdirSync(root, { recursive: true, encoding: 'utf8' })
    .map((file) => file.replaceAll('\\', '/'))
    .filter((file) => /\.(vue|css)$/.test(file))
    .sort()

  test.each(files)('%s uses no physical inline-axis properties', (file) => {
    const found = Array.from(styles(file).matchAll(physicalInlineAxis), (m) =>
      m[0].trim()
    )
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
