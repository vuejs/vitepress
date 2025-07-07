import {
  postcssIsolateStyles,
  splitSelectorPseudo
} from 'node/postcss/isolateStyles'

// helper to run plugin transform on selector
function apply(
  prefixPlugin: ReturnType<typeof postcssIsolateStyles>,
  selector: string
) {
  // `prepare` is available on the runtime plugin but missing from the types, thus cast to `any`
  const { Rule } = (prefixPlugin as any).prepare({
    root: { source: { input: { file: 'foo/base.css' } } }
  })
  const rule = { selectors: [selector] }
  Rule(rule, { result: {} })
  return rule.selectors[0]
}

describe('node/postcss/isolateStyles', () => {
  const plugin = postcssIsolateStyles()

  test('splitSelectorPseudo skips escaped colon', () => {
    const input = '.foo\\:bar'
    const [selector, pseudo] = splitSelectorPseudo(input)
    expect(selector).toBe(input)
    expect(pseudo).toBe('')
  })

  test('splitSelectorPseudo splits on pseudo selectors', () => {
    const input = '.button:hover'
    const [selector, pseudo] = splitSelectorPseudo(input)
    expect(selector).toBe('.button')
    expect(pseudo).toBe(':hover')
  })

  it('postcssIsolateStyles inserts :not(...) in the right place', () => {
    const input = '.disabled\\:opacity-50:disabled'
    const result = apply(plugin, input)
    expect(result).toBe(
      '.disabled\\:opacity-50:not(:where(.vp-raw, .vp-raw *)):disabled'
    )
  })
})
