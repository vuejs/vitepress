import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const vpDocCss = readFileSync(
  fileURLToPath(
    new URL(
      '../../../../src/client/theme-default/styles/components/vp-doc.css',
      import.meta.url
    )
  ),
  'utf8'
)

function ruleFor(css: string, selector: string): string {
  const start = css.indexOf(selector)
  if (start === -1) {
    throw new Error(`missing selector ${selector}`)
  }
  const open = css.indexOf('{', start)
  const close = css.indexOf('}', open)
  return css.slice(open + 1, close)
}

describe('client/theme-default/code-overflow', () => {
  test('code block wrappers clip vertical overflow', () => {
    const rule = ruleFor(vpDocCss, ".vp-doc div[class*='language-']")

    expect(rule).toMatch(/overflow-x:\s*auto/)
    expect(rule).toMatch(/overflow-y:\s*hidden/)
  })
})
