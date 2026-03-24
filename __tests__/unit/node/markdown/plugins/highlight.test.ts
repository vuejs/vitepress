import { highlight } from 'node/markdown/plugins/highlight'

describe('node/markdown/plugins/highlight', () => {
  test('passes color replacements through markdown options', async () => {
    const [render, dispose] = await highlight(
      { light: 'github-light', dark: 'github-dark' },
      {
        colorReplacements: {
          'github-light': {
            '#005cc5': '#000000'
          }
        }
      }
    )

    try {
      const html = await render('const a = 1', 'js', '')

      expect(html).toContain('--shiki-light:#000000')
      expect(html).toContain('--shiki-dark:#79B8FF')
      expect(html).not.toContain('--shiki-light:#005CC5')
    } finally {
      dispose()
    }
  })
})
