import { createHash, randomUUID } from 'node:crypto'
import { mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { deserialize, serialize } from 'node:v8'
import type { MarkdownCompileResult } from '../../markdownToVue'
import { slash } from '../../shared'

export type PageArtifactFinalizer = (
  artifact: MarkdownCompileResult
) => Promise<MarkdownCompileResult>

interface CurrentPageArtifact {
  inputHash: string
  file: string
  finalized: boolean
}

/**
 * A build-local disk spool for compiled Markdown. It keeps only file
 * references in memory while the client build, SSR compiler, and local search
 * share the same page artifacts.
 */
export class PageArtifactStore {
  readonly root: string

  readonly #current = new Map<string, CurrentPageArtifact>()
  readonly #pending = new Map<string, Promise<MarkdownCompileResult>>()

  constructor(root: string) {
    this.root = path.resolve(root)
  }

  async getCurrent(page: string): Promise<MarkdownCompileResult | undefined> {
    const current = this.#current.get(normalizePageKey(page))
    return current ? readArtifact(current.file) : undefined
  }

  async getOrCreate(
    page: string,
    transformedSource: string,
    compile: () => Promise<MarkdownCompileResult>,
    finalize?: PageArtifactFinalizer
  ): Promise<MarkdownCompileResult> {
    page = normalizePageKey(page)
    const inputHash = hash(transformedSource)
    const operationKey = `${page}\0${inputHash}`
    const pending = this.#pending.get(operationKey)
    if (pending) return pending

    const operation = (async () => {
      const current = this.#current.get(page)
      if (
        current?.inputHash === inputHash &&
        (!finalize || current.finalized)
      ) {
        const artifact = await readArtifact(current.file)
        if (artifact) return artifact
      }

      const base = await compile()
      const artifact = finalize ? await finalize(base) : base
      const file = this.#artifactPath(page, inputHash)
      await writeArtifact(file, artifact)
      this.#current.set(page, {
        inputHash,
        file,
        finalized: !!finalize
      })
      return artifact
    })()

    this.#pending.set(operationKey, operation)
    try {
      return await operation
    } finally {
      this.#pending.delete(operationKey)
    }
  }

  async flush(): Promise<void> {
    await Promise.all(this.#pending.values())
  }

  #artifactPath(page: string, inputHash: string): string {
    const artifactHash = hash(`${page}\0${inputHash}`)
    return path.join(this.root, artifactHash.slice(0, 2), `${artifactHash}.bin`)
  }
}

function normalizePageKey(page: string): string {
  return slash(page).replace(/^\.\//, '')
}

async function readArtifact(
  file: string
): Promise<MarkdownCompileResult | undefined> {
  try {
    return deserialize(await readFile(file)) as MarkdownCompileResult
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return
    throw error
  }
}

async function writeArtifact(
  file: string,
  artifact: MarkdownCompileResult
): Promise<void> {
  await mkdir(path.dirname(file), { recursive: true })
  const temporary = `${file}.${process.pid}.${randomUUID()}.tmp`
  try {
    await writeFile(temporary, serialize(artifact), { mode: 0o600 })
    await rename(temporary, file)
  } finally {
    await unlink(temporary).catch(() => {})
  }
}

function hash(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}
