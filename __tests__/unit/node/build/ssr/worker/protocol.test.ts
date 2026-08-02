import { serializeSsrRenderWorkerResult } from 'node/build/ssr/worker/protocol'

test('explains the batching constraint for non-transferable context', () => {
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
