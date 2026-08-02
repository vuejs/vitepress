import { createHash, randomUUID } from 'node:crypto'
import { mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { deserialize, serialize } from 'node:v8'
import type { MarkdownCompileResult } from './markdownToVue'
import { slash } from './shared'

const PAGE_ARTIFACT_SCHEMA_VERSION = 8

export interface PageArtifactManifestEntry {
  inputHash: string
  objectHash: string
  dependencies: { file: string; hash: string }[]
  metadata: PageArtifactMetadata
}

export interface PageArtifactMetadata {
  staticPage: boolean
  requiresSourceModuleIdentity: boolean
}

interface PageArtifactManifest {
  schemaVersion: number
  namespace: string
  entries: Record<string, PageArtifactManifestEntry>
}

type StoredArtifactOverlay = Omit<
  MarkdownCompileResult,
  'html' | 'staticHtml' | 'vueSrc'
>

type StoredVueSource = { source: string } | { prefix: string; suffix: string }

interface StoredPageArtifact {
  schemaVersion: number
  artifact: StoredArtifactOverlay
  htmlHash: string
  staticHtmlHash?: string
  vueSource: StoredVueSource
}

export type PageArtifactFinalizer = (
  artifact: MarkdownCompileResult
) => Promise<MarkdownCompileResult>

interface CurrentPageArtifact {
  inputHash: string
  objectHash: string
  finalized: boolean
}

export interface PageArtifactStoreOptions {
  /**
   * Fingerprint all input that can change Markdown output. Include the
   * VitePress version, routes, config dependencies, base, Markdown options,
   * and relevant environment data.
   */
  namespace: string
  /** Prevent creation of missing artifacts. Useful in render-only workers. */
  readOnly?: boolean
}

/**
 * Store compiled Markdown and Vue data by content hash. The manifest keeps
 * only hashes and dependency paths. Write HTML bodies and route overlays to
 * separate objects. This limits memory use and lets identical bodies share
 * storage.
 */
export class PageArtifactStore {
  readonly root: string
  readonly namespace: string
  readonly readOnly: boolean

  readonly #manifestPath: string
  readonly #objectsDir: string
  readonly #bodiesDir: string
  readonly #entries = new Map<string, PageArtifactManifestEntry>()
  // Keep only CAS references in memory. Read final Vue and HTML strings on
  // demand so a streaming build does not retain every page.
  readonly #current = new Map<string, CurrentPageArtifact>()
  readonly #pending = new Map<string, Promise<MarkdownCompileResult>>()
  readonly #dependencyHashes = new Map<string, Promise<string>>()
  #loaded: Promise<void> | undefined
  #dirty = false

  constructor(root: string, options: PageArtifactStoreOptions) {
    this.namespace = options.namespace
    this.readOnly = options.readOnly ?? false

    const namespaceHash = hash(options.namespace).slice(0, 20)
    this.root = path.resolve(root, 'vitepress-page-artifacts')
    this.#manifestPath = path.join(
      this.root,
      'manifests',
      `${namespaceHash}.json`
    )
    this.#objectsDir = path.join(this.root, 'objects')
    this.#bodiesDir = path.join(this.root, 'bodies')
  }

  /**
   * Read an artifact only if its Markdown input and all included dependencies
   * still match the manifest.
   */
  async get(
    page: string,
    transformedSource: string
  ): Promise<MarkdownCompileResult | undefined> {
    await this.#load()
    page = normalizePageKey(page)

    const inputHash = this.createInputHash(page, transformedSource)
    const stored = await this.#getValidatedStored(page, inputHash)
    if (!stored) return

    this.#current.set(page, {
      inputHash,
      objectHash: stored.objectHash,
      finalized: false
    })
    return stored.artifact
  }

  /**
   * Return an artifact that this build validated or created. Use this for
   * coordinator tasks such as local search.
   */
  async getCurrent(page: string): Promise<MarkdownCompileResult | undefined> {
    await this.#load()
    page = normalizePageKey(page)
    const current = this.#current.get(page)
    return current ? this.#readObject(current.objectHash) : undefined
  }

  /** Read small routing metadata without parsing the full artifact object. */
  async getCurrentMetadata(
    page: string
  ): Promise<PageArtifactMetadata | undefined> {
    await this.#load()
    page = normalizePageKey(page)
    if (!this.#current.has(page)) return
    const metadata = this.#entries.get(page)?.metadata
    return metadata ? { ...metadata } : undefined
  }

  async put(
    page: string,
    transformedSource: string,
    artifact: MarkdownCompileResult
  ): Promise<void> {
    if (this.readOnly) {
      throw new Error(
        `Cannot create page artifact for ${page} in read-only mode.`
      )
    }
    await this.#load()
    page = normalizePageKey(page)

    await this.#putBase(page, transformedSource, artifact, true)
  }

  /**
   * Deduplicate concurrent requests for the same page and input. A read-only
   * caller can omit `compile` to make a cache miss an error.
   */
  async getOrCreate(
    page: string,
    transformedSource: string,
    compile?: () => Promise<MarkdownCompileResult>,
    finalize?: PageArtifactFinalizer
  ): Promise<MarkdownCompileResult> {
    page = normalizePageKey(page)
    const operationKey = this.createInputHash(page, transformedSource)
    const pending = this.#pending.get(operationKey)
    if (pending) return pending

    const operation = (async () => {
      await this.#load()
      const current = this.#current.get(page)
      if (
        current?.inputHash === operationKey &&
        (!finalize || current.finalized)
      ) {
        const currentArtifact = await this.#readObject(current.objectHash)
        if (currentArtifact) return currentArtifact
      }

      let baseStored = await this.#getValidatedStored(page, operationKey)
      if (!baseStored) {
        if (!compile) {
          throw new Error(
            `Missing or stale Markdown artifact for ${page}. ` +
              'The coordinator must compile page artifacts before starting render workers.'
          )
        }

        const artifact = await compile()
        const objectHash = await this.#putBase(
          page,
          transformedSource,
          artifact,
          false
        )
        baseStored = { objectHash, artifact }
      }

      const artifact = finalize
        ? await finalize(baseStored.artifact)
        : baseStored.artifact
      let objectHash = baseStored.objectHash
      if (finalize) {
        if (artifact === baseStored.artifact) {
          objectHash = baseStored.objectHash
        } else if (this.readOnly) {
          objectHash = this.#hashStoredArtifact(artifact)
          if (!(await this.#readStoredObject(objectHash))) {
            throw new Error(
              `Missing finalized Markdown artifact for ${page}. ` +
                'The coordinator must finalize page data before starting read-only consumers.'
            )
          }
        } else {
          objectHash = await this.#writeStoredObject(artifact)
        }
      }
      this.#current.set(page, {
        inputHash: operationKey,
        objectHash,
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

  createInputHash(page: string, transformedSource: string): string {
    return hashParts([
      `vitepress-page-artifact-v${PAGE_ARTIFACT_SCHEMA_VERSION}`,
      this.namespace,
      normalizePageKey(page),
      transformedSource
    ])
  }

  /** Flushes the small sorted manifest after a streaming compilation pass. */
  async flush(): Promise<void> {
    await this.#load()
    if (this.readOnly || !this.#dirty) return

    const entries = Object.fromEntries(
      [...this.#entries].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    )
    const manifest: PageArtifactManifest = {
      schemaVersion: PAGE_ARTIFACT_SCHEMA_VERSION,
      namespace: this.namespace,
      entries
    }

    await mkdir(path.dirname(this.#manifestPath), { recursive: true })
    await atomicWrite(this.#manifestPath, JSON.stringify(manifest))
    this.#dirty = false
  }

  async #load(): Promise<void> {
    if (this.#loaded) return this.#loaded

    this.#loaded = (async () => {
      try {
        const manifest = JSON.parse(
          await readFile(this.#manifestPath, 'utf8')
        ) as PageArtifactManifest
        if (
          manifest.schemaVersion !== PAGE_ARTIFACT_SCHEMA_VERSION ||
          manifest.namespace !== this.namespace
        ) {
          return
        }
        for (const [page, entry] of Object.entries(manifest.entries)) {
          this.#entries.set(page, entry)
        }
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
          // Do not fail a build because the cache is incomplete or corrupt.
          // Treat it as a miss. A successful build replaces the manifest.
          return
        }
      }
    })()

    return this.#loaded
  }

  async #readObject(
    objectHash: string
  ): Promise<MarkdownCompileResult | undefined> {
    return this.#readStoredObject(objectHash)
  }

  async #readStoredObject(
    objectHash: string
  ): Promise<MarkdownCompileResult | undefined> {
    try {
      const stored = deserialize(
        await readFile(this.#objectPath(objectHash))
      ) as StoredPageArtifact
      if (stored.schemaVersion !== PAGE_ARTIFACT_SCHEMA_VERSION) return
      const [html, staticHtml] = await Promise.all([
        readFile(this.#bodyPath(stored.htmlHash), 'utf8'),
        stored.staticHtmlHash
          ? readFile(this.#bodyPath(stored.staticHtmlHash), 'utf8')
          : undefined
      ])
      const vueSrc =
        'source' in stored.vueSource
          ? stored.vueSource.source
          : `${stored.vueSource.prefix}${html}${stored.vueSource.suffix}`
      return {
        ...stored.artifact,
        html,
        vueSrc,
        ...(staticHtml === undefined ? {} : { staticHtml })
      }
    } catch {
      return
    }
  }

  async #getValidatedStored(
    page: string,
    inputHash: string
  ): Promise<
    { objectHash: string; artifact: MarkdownCompileResult } | undefined
  > {
    const entry = this.#entries.get(page)
    if (!entry || entry.inputHash !== inputHash) return
    if (!(await this.#dependenciesMatch(entry.dependencies))) return

    const artifact = await this.#readStoredObject(entry.objectHash)
    return artifact ? { objectHash: entry.objectHash, artifact } : undefined
  }

  async #putBase(
    page: string,
    transformedSource: string,
    artifact: MarkdownCompileResult,
    markCurrent: boolean
  ): Promise<string> {
    const objectHash = await this.#writeStoredObject(artifact)
    const inputHash = this.createInputHash(page, transformedSource)
    const dependencies = await this.#hashDependencies(artifact.includes)
    this.#entries.set(page, {
      inputHash,
      objectHash,
      dependencies,
      metadata: {
        staticPage: artifact.staticPage === true,
        requiresSourceModuleIdentity:
          artifact.requiresSourceModuleIdentity === true
      }
    })
    if (markCurrent) {
      this.#current.set(page, {
        inputHash,
        objectHash,
        finalized: false
      })
    }
    this.#dirty = true
    return objectHash
  }

  async #writeStoredObject(artifact: MarkdownCompileResult): Promise<string> {
    const stored = this.#createStoredArtifact(artifact)
    await Promise.all([
      this.#writeBody(stored.htmlHash, artifact.html),
      stored.staticHtmlHash && artifact.staticHtml !== undefined
        ? this.#writeBody(stored.staticHtmlHash, artifact.staticHtml)
        : undefined
    ])
    const source = serialize(stored)
    const objectHash = hash(source)
    const objectPath = this.#objectPath(objectHash)
    await mkdir(path.dirname(objectPath), { recursive: true })
    await atomicWriteIfChanged(objectPath, source)
    return objectHash
  }

  #hashStoredArtifact(artifact: MarkdownCompileResult): string {
    return hash(serialize(this.#createStoredArtifact(artifact)))
  }

  #createStoredArtifact(artifact: MarkdownCompileResult): StoredPageArtifact {
    const { html, staticHtml, vueSrc, ...overlay } = artifact
    return {
      schemaVersion: PAGE_ARTIFACT_SCHEMA_VERSION,
      artifact: overlay,
      htmlHash: hash(html),
      ...(staticHtml === undefined ? {} : { staticHtmlHash: hash(staticHtml) }),
      vueSource: compactVueSource(vueSrc, html)
    }
  }

  async #writeBody(bodyHash: string, body: string): Promise<void> {
    const bodyPath = this.#bodyPath(bodyHash)
    await mkdir(path.dirname(bodyPath), { recursive: true })
    await atomicWriteIfChanged(bodyPath, Buffer.from(body))
  }

  #objectPath(objectHash: string): string {
    return path.join(
      this.#objectsDir,
      objectHash.slice(0, 2),
      `${objectHash}.bin`
    )
  }

  #bodyPath(bodyHash: string): string {
    return path.join(this.#bodiesDir, bodyHash.slice(0, 2), `${bodyHash}.html`)
  }

  async #hashDependencies(
    files: string[]
  ): Promise<PageArtifactManifestEntry['dependencies']> {
    const uniqueFiles = [...new Set(files.map((file) => slash(file)))].sort()
    return Promise.all(
      uniqueFiles.map(async (file) => ({
        file,
        hash: await this.#hashDependency(file)
      }))
    )
  }

  async #dependenciesMatch(
    dependencies: PageArtifactManifestEntry['dependencies']
  ): Promise<boolean> {
    const matches = await Promise.all(
      dependencies.map(
        async ({ file, hash: expected }) =>
          (await this.#hashDependency(file)) === expected
      )
    )
    return matches.every(Boolean)
  }

  #hashDependency(file: string): Promise<string> {
    let pending = this.#dependencyHashes.get(file)
    if (!pending) {
      pending = readFile(file).then(hash, () => '<missing>')
      this.#dependencyHashes.set(file, pending)
    }
    return pending
  }
}

function normalizePageKey(page: string): string {
  return slash(page).replace(/^\.\//, '')
}

function compactVueSource(vueSrc: string, html: string): StoredVueSource {
  const template = `<template><div>${html}</div></template>`
  const index = vueSrc.indexOf(template)
  if (index < 0) return { source: vueSrc }

  const bodyOffset = index + '<template><div>'.length
  return {
    prefix: vueSrc.slice(0, bodyOffset),
    suffix: vueSrc.slice(bodyOffset + html.length)
  }
}

function hash(value: string | Uint8Array): string {
  return createHash('sha256').update(value).digest('hex')
}

function hashParts(parts: string[]): string {
  const digest = createHash('sha256')
  for (const part of parts) {
    digest.update(`${Buffer.byteLength(part)}:`)
    digest.update(part)
  }
  return digest.digest('hex')
}

async function atomicWriteIfChanged(file: string, content: Uint8Array) {
  try {
    if (Buffer.compare(await readFile(file), content) === 0) return
  } catch {}
  await atomicWrite(file, content)
}

async function atomicWrite(file: string, content: string | Uint8Array) {
  const temporary = `${file}.${process.pid}.${randomUUID()}.tmp`
  await writeFile(temporary, content, { mode: 0o600 })
  try {
    await rename(temporary, file)
  } finally {
    await unlink(temporary).catch(() => {})
  }
}
