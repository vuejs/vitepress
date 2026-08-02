import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import type { FetchResult } from 'vite/module-runner'

export const SSR_MODULE_ARTIFACT_VERSION = 2

export type MaterializedSsrModuleResult = Exclude<FetchResult, { cache: true }>

export interface StoredSsrModuleArtifact {
  version: typeof SSR_MODULE_ARTIFACT_VERSION
  result: MaterializedSsrModuleResult
  dependencies: string[]
  hasUnknownDynamicImports: boolean
}

export interface SsrModuleStoreSnapshot {
  version: typeof SSR_MODULE_ARTIFACT_VERSION
  requests: [key: string, artifact: string][]
}

export function hashSsrModuleValue(value: string | Buffer): string {
  return createHash('sha256').update(value).digest('hex')
}

export function ssrModuleCacheFile(root: string, hash: string): string {
  return path.join(root, hash.slice(0, 2), `${hash.slice(2)}.json`)
}

export function createSsrModuleRequestKey(
  id: string,
  importer: string | undefined
): string {
  // Plugin resolvers can use the importer even when `id` is absolute. Include
  // the importer in the request key. The module store still deduplicates equal
  // results after resolution.
  return JSON.stringify([SSR_MODULE_ARTIFACT_VERSION, id, importer ?? null])
}

async function readStoredSsrModuleArtifact(
  storeRoot: string,
  artifactHash: string
): Promise<StoredSsrModuleArtifact | undefined> {
  try {
    const artifact = JSON.parse(
      await readFile(
        ssrModuleCacheFile(path.join(storeRoot, 'modules'), artifactHash),
        'utf8'
      )
    ) as StoredSsrModuleArtifact
    if (artifact.version !== SSR_MODULE_ARTIFACT_VERSION) return
    return artifact
  } catch (error) {
    if (
      error instanceof SyntaxError ||
      (error as NodeJS.ErrnoException).code === 'ENOENT'
    ) {
      return
    }
    throw error
  }
}

export class SsrModuleArtifactReader {
  readonly #snapshot: Promise<Map<string, string>>
  readonly #artifacts = new Map<
    string,
    Promise<StoredSsrModuleArtifact | undefined>
  >()

  constructor(
    private readonly storeRoot: string,
    snapshotPath: string
  ) {
    this.#snapshot = this.#readSnapshot(snapshotPath)
  }

  async read(
    id: string,
    importer: string | undefined
  ): Promise<StoredSsrModuleArtifact | undefined> {
    const key = createSsrModuleRequestKey(id, importer)
    const artifactHash = (await this.#snapshot).get(key)
    if (!artifactHash) return

    let artifact = this.#artifacts.get(artifactHash)
    if (!artifact) {
      artifact = readStoredSsrModuleArtifact(this.storeRoot, artifactHash)
      this.#artifacts.set(artifactHash, artifact)
    }
    return artifact
  }

  async #readSnapshot(snapshotPath: string): Promise<Map<string, string>> {
    try {
      const snapshot = JSON.parse(
        await readFile(snapshotPath, 'utf8')
      ) as SsrModuleStoreSnapshot
      if (snapshot.version !== SSR_MODULE_ARTIFACT_VERSION) return new Map()
      return new Map(snapshot.requests)
    } catch (error) {
      if (
        error instanceof SyntaxError ||
        (error as NodeJS.ErrnoException).code === 'ENOENT'
      ) {
        return new Map()
      }
      throw error
    }
  }
}
