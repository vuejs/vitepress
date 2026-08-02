import { highlight } from 'node/markdown/plugins/highlight'

describe('node/markdown/plugins/highlight', () => {
  test('initializes lazily and deduplicates highlights in memory', async () => {
    let setupCalls = 0
    let highlightCalls = 0
    const [render, dispose] = await highlight('github-light', {
      async shikiSetup(highlighter) {
        setupCalls++
        const codeToHtml = highlighter.codeToHtml.bind(highlighter)
        highlighter.codeToHtml = ((...args: Parameters<typeof codeToHtml>) => {
          highlightCalls++
          return codeToHtml(...args)
        }) as typeof highlighter.codeToHtml
      }
    })

    expect(setupCalls).toBe(0)
    try {
      const [first, second] = await Promise.all([
        render('const value = true', 'js', ''),
        render('const value = true', 'js', '')
      ])
      const third = await render('const value = true', 'js', '')

      expect(first).toBe(second)
      expect(third).toBe(first)
      expect(setupCalls).toBe(1)
      expect(highlightCalls).toBe(1)
    } finally {
      dispose()
    }
  })

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
