import { highlight } from 'node/markdown/plugins/highlight'

describe('node/markdown/plugins/highlight', () => {
  test('passes color replacements through shiki options', async () => {
    const [render, dispose] = await highlight({
      theme: { light: 'github-light', dark: 'github-dark' },
      colorReplacements: {
        'github-light': {
          '#005cc5': '#000000'
        }
      }
    })

    try {
      const html = await render('const a = 1', 'js', '')

      expect(html).toContain('--shiki-light:#000000')
      expect(html).toContain('--shiki-dark:#79B8FF')
      expect(html).not.toContain('--shiki-light:#005CC5')
    } finally {
      dispose()
    }
  })

  test('renders with default dual themes when no options are passed', async () => {
    const [render, dispose] = await highlight()

    try {
      const html = await render('const a = 1', 'js', '')

      expect(html).toContain('--shiki-light:')
      expect(html).toContain('--shiki-dark:')
    } finally {
      dispose()
    }
  })

  test('loads defaultLang for blocks with an unknown language', async () => {
    const warnings: string[] = []
    const [render, dispose] = await highlight(
      { defaultLang: 'python' },
      { warn: (msg) => void warnings.push(String(msg)) }
    )

    try {
      const html = await render('print("hi")', 'notalang', '')

      expect(html).toContain('class="shiki')
      expect(warnings).toHaveLength(1)
      expect(warnings[0]).toContain("falling back to 'python'")
    } finally {
      dispose()
    }
  })
})
