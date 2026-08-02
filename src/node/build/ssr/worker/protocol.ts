import { serialize } from 'node:v8'
import type { SerializedRenderedPage } from '../../render/page'

export type SerializedSsrBuiltin =
  | { type: 'string'; value: string }
  | { type: 'RegExp'; source: string; flags: string }

export interface SsrRenderWorkerPage {
  page: string
  routePath: string
  moduleId: string | null
}

export interface SsrRenderWorkerDescriptor {
  type: 'ssr-render'
  runtimePath: string
  moduleStorePath: string
  moduleSnapshotPath: string
  builtins: SerializedSsrBuiltin[]
  resultPath: string
  renderConcurrency: number
  pages: SsrRenderWorkerPage[]
}

export interface SsrRenderWorkerResult {
  pages: SerializedRenderedPage[]
}

export function validateSsrRenderWorkerResult(
  value: unknown,
  expectedPages: readonly SsrRenderWorkerPage[]
): asserts value is SsrRenderWorkerResult {
  if (!value || typeof value !== 'object') {
    throw new Error('SSR render worker returned a non-object result.')
  }
  const pages = (value as { pages?: unknown }).pages
  if (!Array.isArray(pages)) {
    throw new Error('SSR render worker result is missing its pages array.')
  }
  if (pages.length !== expectedPages.length) {
    throw new Error(
      `SSR render worker returned ${pages.length} pages; expected ${expectedPages.length}.`
    )
  }

  for (let index = 0; index < pages.length; index++) {
    const rendered = pages[index]
    const expected = expectedPages[index].page
    if (
      !rendered ||
      typeof rendered !== 'object' ||
      (rendered as { page?: unknown }).page !== expected
    ) {
      throw new Error(
        `SSR render worker result ${index} does not match expected page ${expected}.`
      )
    }
  }
}

export function serializeSsrRenderWorkerResult(
  result: SsrRenderWorkerResult
): Buffer {
  try {
    return serialize(result)
  } catch (error) {
    throw new Error(
      'Unable to transfer the SSR render result to the build coordinator. Custom values added to SSGContext must be structured-cloneable when ssrBuildBatchSize is enabled; functions, symbols, WeakMaps, and proxies cannot cross the render-worker boundary.',
      { cause: error }
    )
  }
}
