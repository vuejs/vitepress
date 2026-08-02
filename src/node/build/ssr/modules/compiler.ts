import { mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import {
  createRunnableDevEnvironment,
  mergeConfig,
  moduleRunnerTransform,
  normalizePath,
  resolveConfig,
  type EnvironmentModuleGraph,
  type EnvironmentModuleNode,
  type InlineConfig,
  type Plugin,
  type ResolvedConfig,
  type RunnableDevEnvironment
} from 'vite'
import {
  ESModulesEvaluator,
  type FetchFunctionOptions,
  type FetchResult
} from 'vite/module-runner'
import type { Awaitable } from '../../../shared'
import {
  getVueDescriptorMemoryApi,
  type VueDescriptorMemoryApi
} from '../vueDescriptorMemory'
import {
  createSsrModuleRequestKey,
  hashSsrModuleValue,
  ssrModuleCacheFile,
  SSR_MODULE_ARTIFACT_VERSION,
  type MaterializedSsrModuleResult,
  type SsrModuleStoreSnapshot,
  type StoredSsrModuleArtifact
} from './store'
import {
  adaptSsrBatchPagePlugins,
  validateSsrBatchPageOutputHooks
} from '../pluginCompatibility'
import type { SerializedSsrBuiltin } from '../worker/protocol'

export type { SerializedSsrBuiltin } from '../worker/protocol'

type MaterializedFetchResult = MaterializedSsrModuleResult

type InternalEnvironmentModuleGraph = EnvironmentModuleGraph & {
  _unresolvedUrlToModuleMap?: Map<
    string,
    EnvironmentModuleNode | Promise<EnvironmentModuleNode>
  >
  _hasResolveFailedErrorModules?: Set<EnvironmentModuleNode>
}

export type SsrModuleFetchArgs = [
  id: string,
  importer?: string | null,
  options?: FetchFunctionOptions | null
]

export type SsrModuleReplacementMap =
  ReadonlyMap<string, string> | Readonly<Record<string, string>>

export type SsrAssetResolver = (
  id: string,
  importer: string | undefined,
  resolvedId: string | undefined
) => Awaitable<string | undefined>

export interface SsrModuleCompilerOptions {
  /**
   * Map VitePress and theme source IDs to native ESM entries in the shared
   * runtime bundle.
   */
  runtimeBridges?: SsrModuleReplacementMap
  /**
   * Resolve an asset request to its final client URL. Otherwise, unbundled Vite
   * environments return development `/@fs/` URLs.
   */
  resolveAsset?: SsrModuleReplacementMap | SsrAssetResolver
}

export interface SsrModuleCompilerMemoryStats {
  idModules: number
  urlModules: number
  fileEntries: number
  markdownModules: number
  transformedModules: number
  importerEdges: number
  cachedRequests: number
  pendingRequests: number
  vueDescriptors: number
}

export interface SsrMaterializedGraph {
  entries: number
  requests: number
  descriptorFiles: string[]
}

interface SsrModuleRequestMetadata {
  dependencies: string[]
  hasUnknownDynamicImports: boolean
  /** Importer identity ModuleRunner sends while evaluating this result. */
  dependencyImporter?: string
}

function getDependencyImporter(
  result: MaterializedFetchResult
): string | undefined {
  if (!('id' in result)) return
  // ModuleRunner prefers `file` to the resolved module ID. Thus, Vue and
  // Markdown submodules import from the physical file. Virtual modules use
  // `id`.
  return result.file || result.id
}

function normalizeMaterializedResult(
  result: MaterializedFetchResult
): MaterializedFetchResult {
  // This compiler has no watcher or HMR invalidation. Do not replay Vite's
  // initial `invalidate` marker. It can clear a singleton reached through a
  // different URL.
  return 'invalidate' in result && result.invalidate !== false
    ? { ...result, invalidate: false }
    : result
}

function isErrnoException(value: unknown): value is NodeJS.ErrnoException {
  return value instanceof Error && 'code' in value
}

function mapValue(
  map: SsrModuleReplacementMap | undefined,
  ids: Iterable<string>
): string | undefined {
  if (!map) return
  const readonlyMap = map as ReadonlyMap<string, string>
  const record = map as Readonly<Record<string, string>>
  for (const id of ids) {
    const value =
      typeof readonlyMap.get === 'function'
        ? readonlyMap.get(id)
        : Object.prototype.hasOwnProperty.call(record, id)
          ? record[id]
          : undefined
    if (value !== undefined) return value
  }
}

function idCandidates(
  includeCleanId: boolean,
  ...values: (string | undefined)[]
): Set<string> {
  const candidates = new Set<string>()
  const add = (value: string) => {
    candidates.add(value)
    candidates.add(normalizePath(value))
    if (includeCleanId) {
      const clean = value.replace(/[?#].*$/, '')
      candidates.add(clean)
      candidates.add(normalizePath(clean))
    }
  }

  for (const value of values) {
    if (!value) continue
    add(value)

    if (value.startsWith('file://')) {
      try {
        const url = new URL(value)
        add(`${fileURLToPath(url)}${url.search}${url.hash}`)
      } catch {}
    } else if (value.startsWith('/@fs/')) {
      try {
        add(decodeURI(value.slice('/@fs/'.length)))
      } catch {}
    }
  }

  return candidates
}

function asExternalUrl(value: string): string {
  return path.isAbsolute(value) ? pathToFileURL(value).href : value
}

function asPhysicalFile(value: string | null | undefined): string | undefined {
  if (!value) return
  try {
    if (value.startsWith('file://')) {
      value = fileURLToPath(new URL(value))
    } else if (value.startsWith('/@fs/')) {
      value = decodeURI(value.slice('/@fs/'.length))
    }
  } catch {
    return
  }

  value = value.replace(/[?#].*$/, '')
  return path.isAbsolute(value) && !value.startsWith('/@')
    ? normalizePath(value)
    : undefined
}

function asPhysicalSfcFile(
  value: string | null | undefined
): string | undefined {
  const file = asPhysicalFile(value)
  return file && /\.(?:md|vue)$/.test(file) ? file : undefined
}

function hasUnknownDynamicImports(
  code: string,
  knownDynamicImports: number
): boolean {
  const transformedImportCount =
    code.match(/\b__vite_ssr_dynamic_import__\s*\(/g)?.length ?? 0
  return transformedImportCount > knownDynamicImports
}

function deleteGraphEntriesByValue<K, V>(map: Map<K, V>, value: V): void {
  for (const [key, candidate] of map) {
    if (candidate === value) map.delete(key)
  }
}

/**
 * Vite does not expose an API that removes entries from this module graph.
 * Page entries are one-use roots. Remove them after the compiler stores their
 * transformed code. Keep shared dependencies in the graph and request CAS.
 */
function removeOneShotEntry(
  graph: EnvironmentModuleGraph,
  module: EnvironmentModuleNode,
  requestId: string,
  settled = false
): void {
  // A Markdown file can be a page root and a dependency. Keep a node that has
  // a live importer. Only discard its large transform result.
  if (!settled && module.importers.size > 0) {
    graph.updateModuleTransformResult(module, null)
    return
  }

  for (const dependency of module.importedModules) {
    dependency.importers.delete(module)
  }
  for (const importer of module.importers) {
    importer.importedModules.delete(module)
  }
  module.importedModules.clear()
  module.importers.clear()
  module.acceptedHmrDeps.clear()
  module.importedBindings = null

  graph.updateModuleTransformResult(module, null)
  deleteGraphEntriesByValue(graph.urlToModuleMap, module)
  deleteGraphEntriesByValue(graph.idToModuleMap, module)
  deleteGraphEntriesByValue(graph.etagToModuleMap, module)

  if (module.file) {
    const fileModules = graph.fileToModulesMap.get(module.file)
    fileModules?.delete(module)
    if (fileModules?.size === 0) graph.fileToModulesMap.delete(module.file)
  }

  const internal = graph as InternalEnvironmentModuleGraph
  const unresolved = internal._unresolvedUrlToModuleMap
  if (unresolved) {
    const requestCandidates = idCandidates(
      true,
      requestId,
      module.id ?? undefined,
      module.url
    )
    for (const [url, candidate] of unresolved) {
      if (candidate === module || requestCandidates.has(url)) {
        unresolved.delete(url)
      }
    }
  }
  internal._hasResolveFailedErrorModules?.delete(module)
}

/**
 * Own the Vite transform environment for SSR page modules. Workers do not load
 * Vite or access this object. Before rendering, the compiler writes immutable
 * results to a content-addressed store.
 */
export class SsrModuleCompiler {
  private readonly modulesDir: string
  private readonly requestManifest = new Map<string, string>()
  private readonly requestMetadata = new Map<string, SsrModuleRequestMetadata>()
  private readonly pendingRequests = new Map<
    string,
    Promise<MaterializedFetchResult>
  >()
  private readonly runnerStartOffset = new ESModulesEvaluator().startOffset
  private environment: RunnableDevEnvironment | undefined
  private config: ResolvedConfig | undefined
  private closePromise: Promise<void> | undefined
  private vueDescriptorMemory: VueDescriptorMemoryApi | undefined
  private writeId = 0

  constructor(
    private readonly inlineConfig: InlineConfig,
    artifactDir: string,
    private readonly options: SsrModuleCompilerOptions = {}
  ) {
    this.modulesDir = path.join(artifactDir, 'modules')
  }

  async init(): Promise<void> {
    if (this.environment) return

    await mkdir(this.modulesDir, { recursive: true })

    const inlineConfig = mergeConfig(this.inlineConfig, {
      server: {
        // This SSR environment performs a complete compilation. Run every
        // plugin lifecycle hook, including the plugin-vue compiler setup.
        perEnvironmentStartEndDuringDev: true
      },
      environments: {
        ssr: {
          consumer: 'server',
          isBundled: false,
          dev: { moduleRunnerTransform: true }
        }
      }
    } satisfies InlineConfig)

    const config = await resolveConfig(
      inlineConfig,
      'build',
      'production',
      'production',
      false,
      (resolved) => {
        const ssr = resolved.environments.ssr
        if (!ssr) {
          throw new Error(
            'The SSR module compiler requires an SSR environment.'
          )
        }
        ssr.consumer = 'server'
        ssr.isBundled = false
        ssr.dev.moduleRunnerTransform = true
      }
    )
    const ssr = config.environments.ssr
    await validateSsrBatchPageOutputHooks(
      ssr.plugins,
      ssr.build.rolldownOptions.output
    )
    const ssrPlugins = ssr.plugins as Plugin[]
    ssrPlugins.splice(
      0,
      ssrPlugins.length,
      ...adaptSsrBatchPagePlugins(ssrPlugins)
    )

    const environment = createRunnableDevEnvironment('ssr', config, {
      hot: false,
      remoteRunner: { inlineSourceMap: false }
    })

    try {
      await environment.init()
      // This compiler has no watcher, but Vite sets the plugin metadata to watch
      // mode. Clear only that flag. This lets internal adapters release their
      // resources when `closeBundle` runs.
      const pluginContainer = environment.pluginContainer as unknown as {
        minimalContext: { meta: { watchMode: boolean } }
      }
      pluginContainer.minimalContext.meta.watchMode = false
    } catch (error) {
      await environment.close().catch(() => {})
      throw error
    }

    this.config = config
    this.environment = environment
    this.vueDescriptorMemory = getVueDescriptorMemoryApi(config)
  }

  /** Transform and persist an entry, then release Vite's in-memory code. */
  precompile(id: string): Promise<FetchResult> {
    return this.handleFetch([
      id,
      undefined,
      { startOffset: this.runnerStartOffset }
    ])
  }

  /**
   * Compile all page graphs into the disk CAS. After each wave, release
   * its Vue descriptors. This bounds memory and lets Vite close before
   * rendering.
   */
  async materializeGraphs(
    entries: readonly string[],
    concurrency = 1
  ): Promise<SsrMaterializedGraph> {
    if (!Number.isInteger(concurrency) || concurrency < 1) {
      throw new Error('SSR graph materialization concurrency must be positive.')
    }

    const visited = new Set<string>()
    const allDescriptorFiles = new Set<string>()
    let requests = 0

    const visit = async (
      id: string,
      importer: string | undefined,
      waveDescriptorFiles: Set<string>,
      waveGraphFiles: Set<string>
    ): Promise<void> => {
      const key = createSsrModuleRequestKey(id, importer)
      if (visited.has(key)) return
      visited.add(key)

      const result =
        importer === undefined
          ? await this.precompile(id)
          : await this.handleFetch([
              id,
              importer,
              { startOffset: this.runnerStartOffset }
            ])
      requests++

      for (const value of [
        id,
        'id' in result ? result.id : undefined,
        'file' in result ? result.file : undefined
      ]) {
        const graphFile = asPhysicalFile(value)
        if (graphFile) waveGraphFiles.add(graphFile)
        const descriptorFile = asPhysicalSfcFile(value)
        if (descriptorFile) {
          waveDescriptorFiles.add(descriptorFile)
          allDescriptorFiles.add(descriptorFile)
        }
      }

      const metadata = this.requestMetadata.get(key)
      if (metadata?.hasUnknownDynamicImports) {
        throw new Error(
          `SSR page graph contains a runtime-computed import in ${id}. ` +
            'Batched rendering requires every Vite-transformed dependency to be statically discoverable.'
        )
      }
      if (!metadata?.dependencyImporter) return

      for (const dependency of metadata.dependencies) {
        await visit(
          dependency,
          metadata.dependencyImporter,
          waveDescriptorFiles,
          waveGraphFiles
        )
      }
    }

    for (let offset = 0; offset < entries.length; offset += concurrency) {
      const waveDescriptorFiles = new Set<string>()
      const waveGraphFiles = new Set<string>()
      let outcomes: PromiseSettledResult<void>[]
      try {
        outcomes = await Promise.allSettled(
          entries
            .slice(offset, offset + concurrency)
            .map((entry) =>
              visit(entry, undefined, waveDescriptorFiles, waveGraphFiles)
            )
        )
      } finally {
        this.releasePageDescriptors(waveDescriptorFiles)
        this.releasePageGraph(waveGraphFiles)
      }

      const failed = outcomes!.find(
        (outcome): outcome is PromiseRejectedResult =>
          outcome.status === 'rejected'
      )
      if (failed) {
        throw failed.reason
      }
    }

    return {
      entries: entries.length,
      requests,
      descriptorFiles: [...allDescriptorFiles].sort()
    }
  }

  /**
   * Publish the request closure for a set of entry modules. The snapshot
   * contains only request keys and CAS hashes. A worker loads deduplicated code
   * from the shared store on demand.
   */
  async writeSnapshotForEntries(
    entries: readonly string[],
    snapshotPath: string
  ): Promise<number> {
    this.requireEnvironment()

    const reachable = new Set<string>()
    const pending = entries.map((entry) =>
      createSsrModuleRequestKey(entry, undefined)
    )
    while (pending.length > 0) {
      const key = pending.pop()!
      if (reachable.has(key)) continue

      const artifactHash = this.requestManifest.get(key)
      const metadata = this.requestMetadata.get(key)
      if (!artifactHash || !metadata) {
        const [, id, importer] = JSON.parse(key) as [
          number,
          string,
          string | null
        ]
        throw new Error(
          `SSR module ${JSON.stringify(id)}` +
            (importer ? ` imported by ${JSON.stringify(importer)}` : '') +
            ' was not materialized before publishing its worker snapshot.'
        )
      }

      reachable.add(key)
      if (!metadata.dependencyImporter) continue
      for (const dependency of metadata.dependencies) {
        pending.push(
          createSsrModuleRequestKey(dependency, metadata.dependencyImporter)
        )
      }
    }

    const requests = [...reachable]
      .map((key): [string, string] => [key, this.requestManifest.get(key)!])
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    await this.writeSnapshot(snapshotPath, requests)
    return requests.length
  }

  /** Handle the argument tuple sent by Vite's ModuleRunner transport. */
  async handleFetch(args: SsrModuleFetchArgs): Promise<FetchResult> {
    if (this.closePromise) {
      throw new Error('SSR module compiler is closing.')
    }

    const [id, rawImporter, rawOptions] = args
    if (typeof id !== 'string') {
      throw new TypeError('SSR module fetch id must be a string.')
    }
    const importer = typeof rawImporter === 'string' ? rawImporter : undefined
    const fetchOptions = rawOptions ?? undefined

    // Render builds have no watcher. Each first fetch completes before a worker
    // receives it. If ModuleRunner has the module, confirm the cache instead of
    // replaying the first result. A replay can evaluate singletons twice and
    // break circular modules.
    if (fetchOptions?.cached) return { cache: true }

    const key = createSsrModuleRequestKey(id, importer)

    const pending = this.pendingRequests.get(key)
    if (pending) return pending

    // Register the fetch before the first cache operation. Then `close()` can
    // wait for every request, including current CAS reads.
    const request = (async () => {
      const existing = await this.readRequest(key)
      if (existing) return normalizeMaterializedResult(existing)
      return this.fetchAndPersist(key, id, importer, fetchOptions)
    })().finally(() => {
      this.pendingRequests.delete(key)
    })
    this.pendingRequests.set(key, request)
    return request
  }

  getBuiltins(): SerializedSsrBuiltin[] {
    const environment = this.requireEnvironment()
    return environment.config.resolve.builtins.map<SerializedSsrBuiltin>(
      (builtin) =>
        typeof builtin === 'string'
          ? { type: 'string', value: builtin }
          : {
              type: 'RegExp',
              source: builtin.source,
              flags: builtin.flags
            }
    )
  }

  get resolvedConfig(): ResolvedConfig {
    this.requireEnvironment()
    return this.config!
  }

  /** @internal Diagnostic counters for large-site memory investigations. */
  getMemoryStats(): SsrModuleCompilerMemoryStats {
    const graph = this.requireEnvironment().moduleGraph
    let markdownModules = 0
    let transformedModules = 0
    let importerEdges = 0
    for (const module of graph.idToModuleMap.values()) {
      if (module.id?.replace(/[?#].*$/, '').endsWith('.md')) markdownModules++
      if (module.transformResult) transformedModules++
      importerEdges += module.importers.size
    }
    return {
      idModules: graph.idToModuleMap.size,
      urlModules: graph.urlToModuleMap.size,
      fileEntries: graph.fileToModulesMap.size,
      markdownModules,
      transformedModules,
      importerEdges,
      cachedRequests: this.requestManifest.size,
      pendingRequests: this.pendingRequests.size,
      vueDescriptors: this.vueDescriptorMemory?.retainedFiles ?? 0
    }
  }

  /** Release page-local Vue compiler state after its worker has exited. */
  releasePageDescriptors(files: Iterable<string>): void {
    this.vueDescriptorMemory?.release(files)
  }

  /** Remove settled page/query nodes after a materialization wave completes. */
  releasePageGraph(files: Iterable<string>): void {
    const graph = this.requireEnvironment().moduleGraph
    for (const file of files) {
      const normalizedFile = normalizePath(file)
      const modules = graph.fileToModulesMap.get(normalizedFile)
      if (!modules) continue
      for (const module of [...modules]) {
        removeOneShotEntry(graph, module, module.url, true)
      }
    }
  }

  async close(): Promise<void> {
    if (this.closePromise) return this.closePromise

    const environment = this.environment
    if (!environment) return

    const closePromise = (async () => {
      // A failed compilation can leave transforms or CAS writes in progress.
      // Keep the environment open until all accepted work finishes.
      await Promise.allSettled([...this.pendingRequests.values()])
      this.environment = undefined
      this.config = undefined
      this.vueDescriptorMemory = undefined
      this.pendingRequests.clear()
      this.requestManifest.clear()
      this.requestMetadata.clear()

      // `DevEnvironment.close()` hides plugin cleanup errors. Close the plugin
      // container first so the build reports these errors. Then close the
      // environment to release all remaining resources.
      const closeErrors: unknown[] = []
      try {
        await environment.pluginContainer.close()
      } catch (error) {
        closeErrors.push(error)
      }
      try {
        await environment.close()
      } catch (error) {
        closeErrors.push(error)
      }

      if (closeErrors.length === 1) throw closeErrors[0]
      if (closeErrors.length > 1) {
        throw new AggregateError(
          closeErrors,
          'Failed to close the SSR module compiler cleanly.'
        )
      }
    })()
    this.closePromise = closePromise

    try {
      await closePromise
    } finally {
      if (this.closePromise === closePromise) this.closePromise = undefined
    }
  }

  private requireEnvironment(): RunnableDevEnvironment {
    if (!this.environment) {
      throw new Error('SSR module compiler has not been initialized.')
    }
    return this.environment
  }

  private async fetchAndPersist(
    key: string,
    id: string,
    importer: string | undefined,
    options: FetchFunctionOptions | undefined
  ): Promise<MaterializedFetchResult> {
    const environment = this.requireEnvironment()
    const needsResolution =
      this.options.runtimeBridges !== undefined ||
      this.options.resolveAsset !== undefined
    const resolved = needsResolution
      ? await environment.pluginContainer.resolveId(id, importer)
      : null
    // Requests with queries have different module behavior. Never match `?raw`,
    // `?url`, Vue submodules, or plugin queries to the source runtime facade.
    const runtimeCandidates = idCandidates(false, id, resolved?.id)
    const assetCandidates = idCandidates(false, id, resolved?.id)

    const runtimeBridge = mapValue(
      this.options.runtimeBridges,
      runtimeCandidates
    )
    let result: FetchResult

    if (runtimeBridge !== undefined) {
      result = {
        externalize: asExternalUrl(runtimeBridge),
        type: 'module'
      }
    } else {
      const assetUrl = await this.resolveAsset(
        id,
        importer,
        resolved?.id,
        assetCandidates
      )
      if (assetUrl !== undefined) {
        result = await this.createAssetModule(id, assetUrl)
      } else {
        result = await environment.fetchModule(id, importer, options)
        // A new worker cannot use a coordinator-only cache marker. Fetch the
        // result again so the store can transfer it.
        if ('cache' in result) {
          result = await environment.fetchModule(id, importer, {
            ...options,
            cached: false
          })
        }
      }
    }

    if ('cache' in result) {
      throw new Error(`Vite returned an unresolved cache marker for ${id}.`)
    }

    const materialized = normalizeMaterializedResult(result)
    const metadata = this.captureRequestMetadata(materialized, id)
    this.requestMetadata.set(key, metadata)
    try {
      await this.persistRequest(key, materialized, metadata)
      return materialized
    } finally {
      // Always release the source transform, including after a failed cache
      // write. Page entries are one-use roots once their code is in the CAS.
      this.releaseTransform(materialized, id, importer === undefined)
    }
  }

  private async resolveAsset(
    id: string,
    importer: string | undefined,
    resolvedId: string | undefined,
    candidates: Set<string>
  ): Promise<string | undefined> {
    const resolver = this.options.resolveAsset
    if (!resolver) return
    return typeof resolver === 'function'
      ? resolver(id, importer, resolvedId)
      : mapValue(resolver, candidates)
  }

  private async createAssetModule(
    requestId: string,
    assetUrl: string
  ): Promise<MaterializedFetchResult> {
    const id = `\0vitepress:ssr-asset:${hashSsrModuleValue(`${requestId}\0${assetUrl}`)}`
    const source = `export default ${JSON.stringify(assetUrl)}`
    const transformed = await moduleRunnerTransform(source, null, id, source)
    if (!transformed) {
      throw new Error(`Unable to create SSR asset module for ${requestId}.`)
    }
    return {
      code: transformed.code,
      file: null,
      id,
      url: requestId,
      invalidate: false
    }
  }

  private releaseTransform(
    result: MaterializedFetchResult,
    requestId: string,
    removeEntry: boolean
  ): void {
    if (!('id' in result)) return
    const graph = this.requireEnvironment().moduleGraph
    const module = this.findGraphModule(result, requestId)
    if (module) {
      if (removeEntry) {
        removeOneShotEntry(graph, module, requestId)
      } else {
        graph.updateModuleTransformResult(module, null)
      }
    }
  }

  private captureRequestMetadata(
    result: MaterializedFetchResult,
    requestId: string
  ): SsrModuleRequestMetadata {
    if (!('id' in result)) {
      return { dependencies: [], hasUnknownDynamicImports: false }
    }

    const transformed = this.findGraphModule(result, requestId)?.transformResult
    const staticDependencies = transformed?.deps ?? []
    const dynamicDependencies = transformed?.dynamicDeps ?? []
    return {
      dependencies: [
        ...new Set([...staticDependencies, ...dynamicDependencies])
      ],
      hasUnknownDynamicImports: hasUnknownDynamicImports(
        result.code,
        dynamicDependencies.length
      ),
      dependencyImporter: getDependencyImporter(result)
    }
  }

  private findGraphModule(
    result: MaterializedFetchResult,
    requestId: string
  ): EnvironmentModuleNode | undefined {
    if (!('id' in result)) return
    const graph = this.requireEnvironment().moduleGraph
    const candidates = idCandidates(true, result.id, requestId)
    for (const candidate of candidates) {
      const module =
        graph.getModuleById(candidate) ?? graph.urlToModuleMap.get(candidate)
      if (module) return module
      if (path.isAbsolute(candidate)) {
        const fileUrlModule = graph.getModuleById(pathToFileURL(candidate).href)
        if (fileUrlModule) return fileUrlModule
      }
    }
  }

  private async readRequest(
    key: string
  ): Promise<MaterializedFetchResult | undefined> {
    const artifactHash = this.requestManifest.get(key)
    if (!artifactHash) return

    try {
      const artifact = JSON.parse(
        await readFile(
          ssrModuleCacheFile(this.modulesDir, artifactHash),
          'utf8'
        )
      ) as StoredSsrModuleArtifact
      if (artifact.version !== SSR_MODULE_ARTIFACT_VERSION) return
      this.requestMetadata.set(key, {
        dependencies: artifact.dependencies,
        hasUnknownDynamicImports: artifact.hasUnknownDynamicImports,
        dependencyImporter: getDependencyImporter(artifact.result)
      })
      return artifact.result
    } catch (error) {
      if (isErrnoException(error) && error.code === 'ENOENT') return
      if (error instanceof SyntaxError) return
      throw error
    }
  }

  private async persistRequest(
    key: string,
    result: MaterializedFetchResult,
    metadata: SsrModuleRequestMetadata
  ): Promise<void> {
    const artifact: StoredSsrModuleArtifact = {
      version: SSR_MODULE_ARTIFACT_VERSION,
      result,
      dependencies: metadata.dependencies,
      hasUnknownDynamicImports: metadata.hasUnknownDynamicImports
    }
    const artifactJson = JSON.stringify(artifact)
    const artifactHash = hashSsrModuleValue(artifactJson)
    const artifactPath = ssrModuleCacheFile(this.modulesDir, artifactHash)
    await mkdir(path.dirname(artifactPath), { recursive: true })
    try {
      await writeFile(artifactPath, artifactJson, { flag: 'wx' })
    } catch (error) {
      if (!isErrnoException(error) || error.code !== 'EEXIST') throw error
    }

    this.requestManifest.set(key, artifactHash)
  }

  private async writeSnapshot(
    snapshotPath: string,
    requests: [key: string, artifact: string][]
  ): Promise<void> {
    const snapshot: SsrModuleStoreSnapshot = {
      version: SSR_MODULE_ARTIFACT_VERSION,
      requests
    }
    await mkdir(path.dirname(snapshotPath), { recursive: true })
    await this.writeAtomically(snapshotPath, JSON.stringify(snapshot))
  }

  private async writeAtomically(file: string, contents: string): Promise<void> {
    const temporary = `${file}.${process.pid}.${this.writeId++}.tmp`
    await writeFile(temporary, contents)
    try {
      await rename(temporary, file)
    } finally {
      await unlink(temporary).catch((error) => {
        if (!isErrnoException(error) || error.code !== 'ENOENT') throw error
      })
    }
  }
}

export function createSsrModuleCompiler(
  inlineConfig: InlineConfig,
  artifactDir: string,
  options?: SsrModuleCompilerOptions
): SsrModuleCompiler {
  return new SsrModuleCompiler(inlineConfig, artifactDir, options)
}
