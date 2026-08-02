import type { ModuleRunnerTransport } from 'vite/module-runner'
import { SsrModuleArtifactReader } from './store'
import type { SerializedSsrBuiltin } from '../worker/protocol'

interface ViteInvokePayload {
  type: 'custom'
  event: 'vite:invoke'
  data: {
    name: 'fetchModule' | 'getBuiltins'
    data: unknown[]
  }
}

/** Read-only transport for a page graph compiled before workers start. */
export class SsrModuleArtifactTransport implements ModuleRunnerTransport {
  readonly #reader: SsrModuleArtifactReader

  constructor(
    private readonly moduleStorePath: string,
    private readonly builtins: SerializedSsrBuiltin[],
    moduleSnapshotPath: string
  ) {
    this.#reader = new SsrModuleArtifactReader(
      moduleStorePath,
      moduleSnapshotPath
    )
  }

  async invoke(payload: unknown): Promise<{ result: unknown }> {
    if (!isViteInvokePayload(payload)) {
      throw new Error('SSR worker received an invalid Vite invoke payload.')
    }
    if (payload.data.name === 'getBuiltins') {
      return { result: this.builtins }
    }

    const [id, rawImporter, rawOptions] = payload.data.data
    if (typeof id !== 'string') {
      throw new TypeError('SSR module artifact request id must be a string.')
    }
    const importer = typeof rawImporter === 'string' ? rawImporter : undefined
    const options =
      rawOptions && typeof rawOptions === 'object'
        ? (rawOptions as { cached?: boolean })
        : undefined
    if (options?.cached) {
      return { result: { cache: true } }
    }

    const artifact = await this.#reader.read(id, importer)
    if (!artifact) {
      throw new Error(
        `Missing precompiled SSR module ${JSON.stringify(id)}` +
          (importer ? ` imported by ${JSON.stringify(importer)}` : '') +
          `. The coordinator did not materialize the complete page graph at ${this.moduleStorePath}.`
      )
    }
    return { result: artifact.result }
  }
}

function isViteInvokePayload(value: unknown): value is ViteInvokePayload {
  if (!value || typeof value !== 'object') return false
  const payload = value as Partial<ViteInvokePayload>
  const data = payload.data as Partial<ViteInvokePayload['data']> | undefined
  return (
    payload.type === 'custom' &&
    payload.event === 'vite:invoke' &&
    !!data &&
    (data.name === 'fetchModule' || data.name === 'getBuiltins') &&
    Array.isArray(data.data)
  )
}
