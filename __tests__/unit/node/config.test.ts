import type { MarkdownItAsync } from 'markdown-it-async'
import { mergeConfig, type UserConfig } from 'node/config'

describe('node/config', () => {
  test('merges markdown hooks from extended configs', async () => {
    const calls: string[] = []
    const md = {} as MarkdownItAsync

    const merged = mergeConfig<UserConfig, UserConfig>(
      {
        markdown: {
          lineNumbers: true,
          preConfig() {
            calls.push('base-pre')
          },
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
          async preConfig() {
            calls.push('extended-pre')
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

    await merged.markdown?.preConfig?.(md)
    await merged.markdown?.config?.(md)

    expect(calls).toEqual(['base-pre', 'extended-pre', 'base', 'extended'])
  })

  test('keeps one-sided markdown hooks when the other config omits them', async () => {
    const calls: string[] = []
    const md = {} as MarkdownItAsync

    const merged = mergeConfig<UserConfig, UserConfig>(
      {
        markdown: {
          preConfig() {
            calls.push('base-pre')
          }
        }
      },
      {
        markdown: {
          config() {
            calls.push('extended')
          }
        }
      }
    )

    await merged.markdown?.preConfig?.(md)
    await merged.markdown?.config?.(md)

    expect(calls).toEqual(['base-pre', 'extended'])
  })
})
