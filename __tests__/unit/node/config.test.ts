import { mergeConfig } from 'node/config'

describe('node/config', () => {
  test('composes markdown hooks when merging configs', async () => {
    const calls: string[] = []
    const md = {} as any

    const merged = mergeConfig(
      {
        markdown: {
          preConfig: () => {
            calls.push('base-pre')
          },
          config: async () => {
            calls.push('base')
          },
          externalLinks: { rel: 'noopener' }
        }
      },
      {
        markdown: {
          preConfig: async () => {
            calls.push('child-pre')
          },
          config: () => {
            calls.push('child')
          },
          externalLinks: { target: '_blank' }
        }
      }
    )

    await merged.markdown?.preConfig?.(md)
    await merged.markdown?.config?.(md)

    expect(calls).toEqual(['base-pre', 'child-pre', 'base', 'child'])
    expect(merged.markdown?.externalLinks).toEqual({
      rel: 'noopener',
      target: '_blank'
    })
  })
})
