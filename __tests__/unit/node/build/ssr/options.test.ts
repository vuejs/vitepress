import {
  createRenderQueue,
  createSsrBatchPlan,
  resolveSsrBatchOptions,
  validateBuildConcurrency
} from 'node/build/ssr/options'

test('requires positive global build concurrency', () => {
  expect(validateBuildConcurrency(1)).toBe(1)
  expect(validateBuildConcurrency(64)).toBe(64)
  for (const value of [undefined, 0, -1, 1.5, Number.NaN, Infinity, '2']) {
    expect(() => validateBuildConcurrency(value)).toThrow(
      'buildConcurrency must be a positive integer.'
    )
  }
})

test('validates worker concurrency only when batching is enabled', () => {
  expect(
    resolveSsrBatchOptions({
      ssrBuildBatchSize: undefined,
      ssrBuildWorkerConcurrency: 0
    } as any)
  ).toBeUndefined()
  expect(
    resolveSsrBatchOptions({
      ssrBuildBatchSize: 64,
      ssrBuildWorkerConcurrency: 2
    } as any)
  ).toEqual({ batchSize: 64, workerConcurrency: 2 })

  for (const value of [0, -1, 1.5, Number.NaN, Infinity, '2', null]) {
    expect(() =>
      resolveSsrBatchOptions({
        ssrBuildBatchSize: value,
        ssrBuildWorkerConcurrency: 1
      } as any)
    ).toThrow('ssrBuildBatchSize must be a positive integer.')
  }
  for (const value of [undefined, 0, -1, 1.5, Number.NaN, '2', null]) {
    expect(() =>
      resolveSsrBatchOptions({
        ssrBuildBatchSize: 2,
        ssrBuildWorkerConcurrency: value
      } as any)
    ).toThrow('ssrBuildWorkerConcurrency must be a positive integer.')
  }
})

test('partitions one normalized render queue without reordering pages', () => {
  const queue = createRenderQueue([
    'a.md',
    'b.md',
    '404.md',
    'c.md',
    'd.md',
    'e.md'
  ])
  const batches = createSsrBatchPlan(queue, 2)
  expect(batches.flatMap((batch) => batch.pages)).toEqual([
    '404.md',
    'a.md',
    'b.md',
    'c.md',
    'd.md',
    'e.md'
  ])
  expect(batches.map((batch) => batch.offset)).toEqual([0, 2, 4])
  expect(batches.every((batch) => batch.pages.length <= 2)).toBe(true)
})

test('supports a 404-only build', () => {
  expect(createSsrBatchPlan(createRenderQueue([]), 10)).toEqual([
    { offset: 0, pages: ['404.md'] }
  ])
})
