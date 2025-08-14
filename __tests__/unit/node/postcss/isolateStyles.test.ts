import { postcssIsolateStyles } from 'node/postcss/isolateStyles'
import postcss from 'postcss'

function apply(selector: string) {
  const { root } = postcss([postcssIsolateStyles()]).process(`${selector} {}`)
  return (root.nodes[0] as any).selector
}

describe('node/postcss/isolateStyles', () => {
  test('splitSelectorPseudo skips escaped colon', () => {
    expect(apply('.foo\\:bar')).toBe(
      '.foo\\:bar:not(:where(.vp-raw, .vp-raw *))'
    )
  })

  test('splitSelectorPseudo splits on pseudo selectors', () => {
    expect(apply('.button:hover')).toBe(
      '.button:not(:where(.vp-raw, .vp-raw *)):hover'
    )
  })

  test('postcssIsolateStyles inserts :not(...) in the right place', () => {
    expect(apply('.disabled\\:opacity-50:disabled')).toBe(
      '.disabled\\:opacity-50:not(:where(.vp-raw, .vp-raw *)):disabled'
    )
  })
})
