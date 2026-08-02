import type { SiteConfig } from '../../config'

export interface SsrBatchOptions {
  batchSize: number
  workerConcurrency: number
}

export interface SsrBatchPlan {
  offset: number
  pages: string[]
}

export function validateBuildConcurrency(value: unknown): number {
  if (!Number.isInteger(value) || (value as number) < 1) {
    throw new Error('buildConcurrency must be a positive integer.')
  }
  return value as number
}

export function resolveSsrBatchOptions(
  siteConfig: Pick<
    SiteConfig,
    'ssrBuildBatchSize' | 'ssrBuildWorkerConcurrency'
  >
): SsrBatchOptions | undefined {
  const batchSize = siteConfig.ssrBuildBatchSize
  if (batchSize === undefined) return
  if (!Number.isInteger(batchSize) || batchSize < 1) {
    throw new Error('ssrBuildBatchSize must be a positive integer.')
  }

  const workerConcurrency = siteConfig.ssrBuildWorkerConcurrency
  if (!Number.isInteger(workerConcurrency) || workerConcurrency < 1) {
    throw new Error('ssrBuildWorkerConcurrency must be a positive integer.')
  }

  return { batchSize, workerConcurrency }
}

export function createRenderQueue(sitePages: readonly string[]): string[] {
  return ['404.md', ...sitePages.filter((page) => page !== '404.md')]
}

export function createSsrBatchPlan(
  renderQueue: readonly string[],
  batchSize: number
): SsrBatchPlan[] {
  const batches: SsrBatchPlan[] = []
  for (let offset = 0; offset < renderQueue.length; offset += batchSize) {
    batches.push({
      offset,
      pages: renderQueue.slice(offset, offset + batchSize)
    })
  }
  return batches
}
