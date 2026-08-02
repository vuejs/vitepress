import { serialize } from 'node:v8'
import type { PageData } from '../shared'
import type { SerializedRenderedPage } from './render'

export type SerializedSsrBuiltin =
  | { type: 'string'; value: string }
  | { type: 'RegExp'; source: string; flags: string }

export interface SsrStaticPagePayload {
  html: string
  pageData: PageData
}

/**
 * Contains all data that a worker needs for one route. `page` is the rewritten
 * output page. `moduleId` identifies the original source module.
 */
export interface SsrRenderWorkerPage {
  page: string
  routePath: string
  moduleId: string | null
  staticPage?: SsrStaticPagePayload
}

/** JSON descriptor written by the build coordinator. */
export interface SsrRenderWorkerDescriptor {
  type: 'ssr-render'
  runtimePath: string
  moduleStorePath: string
  /** Request-key slice containing only modules reachable by this batch. */
  moduleSnapshotPath: string
  builtins: SerializedSsrBuiltin[]
  resultPath: string
  renderConcurrency: number
  pages: SsrRenderWorkerPage[]
}

/** V8-serialized worker output. */
export interface SsrRenderWorkerResult {
  pages: SerializedRenderedPage[]
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
