import type { MarkdownItAsync } from 'markdown-it-async'
import { mergeConfig } from 'node/config'

describe('node/config', () => {
  test('merges markdown config hooks from extended configs', async () => {
    const calls: string[] = []
    const md = {} as MarkdownItAsync

    const merged = mergeConfig(
      {
        markdown: {
          lineNumbers: true,
          config() {
            calls.push('base')
          }
        }
      },
      {
        markdown: {
          attrs: {
            allowedAttributes: ['id']
          },
          async config() {
            calls.push('extended')
          }
        }
      }
    )

    expect(merged.markdown?.lineNumbers).toBe(true)
    expect(merged.markdown?.attrs).toEqual({
      allowedAttributes: ['id']
    })

    await merged.markdown?.config?.(md)

    expect(calls).toEqual(['base', 'extended'])
  })
})
