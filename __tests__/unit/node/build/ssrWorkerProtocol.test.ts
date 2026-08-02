import { serializeSsrRenderWorkerResult } from 'node/build/ssrWorkerProtocol'

describe('SSR render-worker result protocol', () => {
  test('explains the batching constraint for custom non-transferable context', () => {
    expect(() =>
      serializeSsrRenderWorkerResult({
        pages: [
          {
            page: 'guide.md',
            pageData: {} as any,
            hasCustom404: true,
            context: {
              content: '<main>Guide</main>',
              vpSocialIcons: [],
              customCallback: () => undefined
            } as any
          }
        ]
      })
    ).toThrow(/SSGContext must be structured-cloneable/)
  })
})
