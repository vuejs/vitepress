import { getIconsCSS } from '@iconify/utils'
import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import {
  mkdir,
  mkdtemp,
  readFile,
  rm,
  symlink,
  unlink,
  writeFile
} from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { deserialize } from 'node:v8'
import { packageDirectory } from 'package-directory'
import pMap from 'p-map'
import type { BuildOptions } from 'vite'
import { version } from '../../../package.json'
import { resolveConfig, type SiteConfig } from '../config'
import {
  canCompileSsrPageArtifact,
  canReuseSsrPageArtifactWithPlugins,
  createSsrPageArtifactModuleId,
  prepareStaticHtmlForSsr
} from '../markdownToVue'
import { PageArtifactStore } from '../pageArtifacts'
import type { PageMeta } from '../plugin'
import type { Awaitable } from '../shared'
import { cacheAllGitTimestamps } from '../utils/getGitTimestamp'
import { task } from '../utils/task'
import { bundle, createViteBuildConfig } from './bundle'
import { generateSitemap } from './generateSitemap'
import { deserializeRenderedPage, finalizeRenderedPage } from './render'
import {
  clearBuildCaches,
  createRouteDigest,
  disposeBuildCaches,
  getRenderer,
  prepareRenderInputs,
  renderPages
} from './ssrBatch'
import {
  createSsrBatchPlan,
  createWorkerExecArgv,
  validateBuildConcurrency,
  validateSsrBuildBatchSize,
  validateSsrBuildWorkerConcurrency
} from './ssrBatchUtils'
import { createSsrModuleCompiler } from './ssrModuleCompiler'
import {
  type SsrRenderWorkerDescriptor,
  type SsrRenderWorkerPage,
  type SsrRenderWorkerResult
} from './ssrWorkerProtocol'

const require = createRequire(import.meta.url)

function collectGarbageAtPhaseBoundary(): void {
  ;(globalThis as typeof globalThis & { gc?: () => void }).gc?.()
}

async function dispatchRenderWorker(
  descriptor: SsrRenderWorkerDescriptor,
  descriptorPath: string
): Promise<void> {
  await writeFile(descriptorPath, JSON.stringify(descriptor), { mode: 0o600 })
  const workerEntry = fileURLToPath(new URL('./ssrWorker.js', import.meta.url))

  await new Promise<void>((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [...createWorkerExecArgv(process.execArgv), workerEntry, descriptorPath],
      {
        cwd: process.cwd(),
        stdio: 'inherit'
      }
    )
    let settled = false

    const terminateWorker = () => {
      if (child.exitCode === null && child.signalCode === null) child.kill()
    }
    const finish = (error?: unknown) => {
      if (settled) return
      settled = true
      process.removeListener('exit', terminateWorker)
      if (error) terminateWorker()
      if (error) reject(error)
      else resolve()
    }

    process.once('exit', terminateWorker)
    child.once('error', finish)
    child.once('exit', (code, signal) => {
      if (settled) return
      if (code === 0) {
        finish()
      } else {
        finish(
          new Error(
            `SSR render worker failed (${signal ? `signal ${signal}` : `exit ${code}`}).`
          )
        )
      }
    })
  })
}

async function forEachConcurrent<T>(
  values: readonly T[],
  concurrency: number,
  iteratee: (value: T) => Promise<void>
): Promise<void> {
  let nextIndex = 0
  let failed = false
  let firstError: unknown
  const runners = Array.from(
    { length: Math.min(concurrency, values.length) },
    async () => {
      while (!failed) {
        const index = nextIndex++
        if (index >= values.length) return
        try {
          await iteratee(values[index])
        } catch (error) {
          if (!failed) {
            failed = true
            firstError = error
          }
        }
      }
    }
  )

  await Promise.all(runners)
  if (failed) throw firstError
}

function validateWorkerResult(
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

type VitePressBuildOptions = BuildOptions & {
  base?: string
  mpa?: string
  onAfterConfigResolve?: (siteConfig: SiteConfig) => Awaitable<void>
}

export async function build(
  root?: string,
  buildOptions: VitePressBuildOptions = {}
) {
  return buildInternal(root, buildOptions)
}

/** @internal */
export async function buildFromCli(
  root?: string,
  buildOptions: VitePressBuildOptions = {}
) {
  return buildInternal(root, buildOptions)
}

async function buildInternal(
  root: string | undefined,
  buildOptions: VitePressBuildOptions
) {
  const start = performance.now()

  process.env.NODE_ENV = 'production'
  const siteConfig = await resolveConfig(root, 'build', 'production')

  await buildOptions.onAfterConfigResolve?.(siteConfig)
  delete buildOptions.onAfterConfigResolve

  if (buildOptions.base) {
    siteConfig.site.base = buildOptions.base
    delete buildOptions.base
  }

  if (buildOptions.mpa) {
    siteConfig.mpa = true
    delete buildOptions.mpa
  }

  if (buildOptions.outDir) {
    siteConfig.outDir = path.resolve(process.cwd(), buildOptions.outDir)
    delete buildOptions.outDir
  }

  validateBuildConcurrency(siteConfig.buildConcurrency)
  const batchSize = validateSsrBuildBatchSize(siteConfig.ssrBuildBatchSize)
  const workerConcurrency = validateSsrBuildWorkerConcurrency(
    siteConfig.ssrBuildWorkerConcurrency
  )

  if (siteConfig.mpa && batchSize) {
    throw new Error('ssrBuildBatchSize is not compatible with MPA mode.')
  }

  if (process.env.BUNDLE_ONLY && batchSize) {
    throw new Error(
      'BUNDLE_ONLY is not compatible with ssrBuildBatchSize because the shared runtime and page artifacts are consumed by the batched renderer.'
    )
  }

  if (siteConfig.lastUpdated) {
    await task('loading last-updated data', () =>
      cacheAllGitTimestamps(siteConfig.srcDir, ['*.md'], true)
    )
  }

  const unlinkVue = await linkVue()
  const pageMetaMap = Object.create(null) as Record<string, PageMeta>

  try {
    try {
      const usedIcons = new Set<string>()
      let pageToHashMap: Record<string, string>

      if (batchSize) {
        pageToHashMap = await buildWithBatchedSsr(
          siteConfig,
          buildOptions,
          pageMetaMap,
          usedIcons,
          batchSize,
          workerConcurrency
        )
      } else {
        let {
          clientResult,
          serverResult,
          pageToHashMap: pageHashes
        } = await task('building client + server bundles', () =>
          bundle(siteConfig, buildOptions, pageMetaMap, {
            mode: 'full',
            vitePressPluginOptions: { skipGitScan: true }
          })
        )
        pageToHashMap = pageHashes

        if (process.env.BUNDLE_ONLY) return

        const { renderMetadata, additionalHeadTags, metadataScript } =
          await prepareRenderInputs(
            siteConfig,
            clientResult,
            serverResult,
            pageToHashMap
          )

        clientResult = null
        serverResult = null
        clearBuildCaches()
        const render = await getRenderer(siteConfig.tempDir)

        await task('rendering pages', () =>
          renderPages(
            render,
            siteConfig,
            siteConfig.tempDir,
            ['404.md', ...siteConfig.pages],
            renderMetadata,
            pageToHashMap,
            metadataScript,
            additionalHeadTags,
            usedIcons
          )
        )
      }

      const icons = require('@iconify-json/simple-icons/icons.json')
      const iconsCss = getIconsCSS(icons, Array.from(usedIcons).sort(), {
        iconSelector: '.vpi-social-{name}',
        commonSelector: '.vpi-social',
        varName: 'icon',
        format: process.env.DEBUG ? 'expanded' : 'compressed',
        mode: 'mask'
      }).replace(/[^]*?}\n*/, '')

      await writeFile(path.join(siteConfig.outDir, 'vp-icons.css'), iconsCss)

      // Emit the page hash map for sessions that span a redeployment.
      await writeFile(
        path.join(siteConfig.outDir, 'hashmap.json'),
        JSON.stringify(pageToHashMap)
      )
    } finally {
      await unlinkVue()
      if (!process.env.DEBUG) {
        await rm(siteConfig.tempDir, {
          recursive: true,
          force: true,
          maxRetries: 10
        })
      }
    }

    if (siteConfig.sitemap?.hostname) {
      await task('generating sitemap', () =>
        generateSitemap(siteConfig, pageMetaMap)
      )
    }

    await siteConfig.buildEnd?.(siteConfig)

    siteConfig.logger.info(
      `build complete in ${((performance.now() - start) / 1000).toFixed(2)}s.`
    )
  } finally {
    disposeBuildCaches()
  }
}

async function buildWithBatchedSsr(
  siteConfig: SiteConfig,
  buildOptions: BuildOptions,
  pageMetaMap: Record<string, PageMeta>,
  usedIcons: Set<string>,
  batchSize: number,
  workerConcurrency: number
): Promise<Record<string, string>> {
  await mkdir(siteConfig.tempDir, { recursive: true })
  const coordinatorDir = await mkdtemp(
    path.join(siteConfig.tempDir, 'ssr-coordinator-')
  )
  const routeDigest = createRouteDigest(siteConfig)
  const configDependencyDigest = await createConfigDependencyDigest(siteConfig)
  const configuredMarkdown = siteConfig.markdown
  const configuredShikiCacheKey = siteConfig.markdown?.shikiCacheKey
  let pageArtifactStore!: PageArtifactStore
  let clientBuild: Awaited<ReturnType<typeof bundle>> | undefined

  try {
    // The derived key belongs to the coordinator's immutable Markdown cache,
    // not to the public SiteConfig observed by render and build hooks.
    siteConfig.markdown = {
      ...siteConfig.markdown,
      shikiCacheKey: createHash('sha256')
        .update('vitepress-shiki-config-v1')
        .update('\0')
        .update(configDependencyDigest)
        .update('\0')
        .update(configuredShikiCacheKey ?? '')
        .digest('hex')
    }
    const namespace = createPageArtifactNamespace(
      siteConfig,
      routeDigest,
      configDependencyDigest
    )
    const pageArtifactCache = resolvePageArtifactCachePolicy(
      siteConfig,
      coordinatorDir
    )
    pageArtifactStore = new PageArtifactStore(pageArtifactCache.root, {
      namespace
    })

    clientBuild = await task(
      'compiling Markdown and building client bundle',
      () =>
        bundle(siteConfig, buildOptions, pageMetaMap, {
          mode: 'client',
          vitePressPluginOptions: {
            coordinatorClient: true,
            pageArtifactStore,
            skipGitScan: true
          }
        })
    )
    await pageArtifactStore.flush()
  } finally {
    siteConfig.markdown = configuredMarkdown
  }

  if (!clientBuild) {
    throw new Error('The coordinator client build did not produce a result.')
  }
  let { clientResult, pageToHashMap, clientAssetMap } = clientBuild

  const { renderMetadata, additionalHeadTags, metadataScript } =
    await prepareRenderInputs(siteConfig, clientResult, null, pageToHashMap)
  // `clientResult` owns the complete Rolldown output graph. Dropping only the
  // destructured local leaves the same object reachable through `clientBuild`
  // for the entire SSR phase, which can retain several GiB on large sites.
  clientBuild.clientResult = null
  clientBuild.serverResult = null
  clientBuild = undefined
  clientResult = null
  disposeBuildCaches()
  collectGarbageAtPhaseBoundary()

  const runtimeDir = path.join(coordinatorDir, 'runtime')
  let runtimeBuild: Awaited<ReturnType<typeof bundle>> | undefined = await task(
    'building shared SSR runtime',
    () =>
      bundle(siteConfig, buildOptions, undefined, {
        mode: 'ssr-runtime',
        outDir: runtimeDir,
        clientAssetMap
      })
  )
  const { ssrRuntimeBridgeMap } = runtimeBuild
  runtimeBuild.clientResult = null
  runtimeBuild.serverResult = null
  runtimeBuild = undefined
  disposeBuildCaches()
  collectGarbageAtPhaseBoundary()

  type RenderPagePlan = Omit<SsrRenderWorkerPage, 'staticPage'> & {
    isStatic: boolean
  }
  const renderPagesBySource = new Map<string, RenderPagePlan>()
  const ssrPageArtifacts = new Map<string, string>()
  const sourcePages = new Set(siteConfig.pages)
  const renderQueue = [
    '404.md',
    ...siteConfig.pages.filter((page) => page !== '404.md')
  ]
  for (const sourcePage of renderQueue) {
    const page = siteConfig.rewrites.map[sourcePage] || sourcePage
    const hasSource = sourcePages.has(sourcePage)
    const artifactMetadata = hasSource
      ? await pageArtifactStore.getCurrentMetadata(page)
      : undefined
    if (hasSource && !artifactMetadata) {
      throw new Error(
        `Missing client-compiled Markdown artifact for ${sourcePage}.`
      )
    }

    const sourceModuleId = path.resolve(siteConfig.srcDir, sourcePage)
    const artifactModuleId = createSsrPageArtifactModuleId(sourceModuleId)
    const canUseArtifactModule =
      hasSource &&
      !artifactMetadata?.staticPage &&
      canCompileSsrPageArtifact(siteConfig, sourceModuleId, artifactMetadata)
    if (canUseArtifactModule) {
      ssrPageArtifacts.set(artifactModuleId, page)
    }

    renderPagesBySource.set(sourcePage, {
      page,
      routePath: `/${page.replace(/\.md$/, '')}`,
      moduleId:
        hasSource && !artifactMetadata?.staticPage
          ? canUseArtifactModule
            ? artifactModuleId
            : sourceModuleId
          : null,
      isStatic: !!artifactMetadata?.staticPage
    })
  }

  const ssrConfig = await createViteBuildConfig(siteConfig, buildOptions, {
    ssr: true,
    pages: [],
    outDir: path.join(coordinatorDir, 'page-compiler'),
    isolatedSsr: true,
    vitePressPluginOptions: {
      pageArtifactStore,
      ssrPageArtifacts,
      skipGitScan: true
    }
  })
  const moduleStorePath = path.join(coordinatorDir, 'ssr-modules')
  const batches = createSsrBatchPlan(siteConfig.pages, batchSize)
  const batchModuleSnapshots = new Map<number, string>()
  const compiler = createSsrModuleCompiler(ssrConfig, moduleStorePath, {
    persistEntries: true,
    releaseEntries: true,
    snapshotOnly: true,
    publishFullSnapshot: false,
    runtimeBridges: new Map(Object.entries(ssrRuntimeBridgeMap)),
    resolveAsset: clientAssetMap
  })

  let builtins: ReturnType<typeof compiler.getBuiltins> = []
  try {
    await compiler.init()

    // Client and SSR environments may receive different plugin instances from
    // `vite.config.*` or `applyToEnvironment`. Finalize the optimization only
    // after the actual unbundled SSR environment is resolved. Any hook that can
    // observe the physical Markdown/module identity demotes the page to that
    // path; the store still reuses the client Markdown result when the SSR
    // source transform proves byte-identical at runtime.
    const resolvedSsrConfig = compiler.resolvedConfig.environments.ssr
    const resolvedSsrArtifactPlugins = [
      resolvedSsrConfig.plugins,
      resolvedSsrConfig.build.rolldownOptions.plugins
    ]
    for (const [sourcePage, plan] of renderPagesBySource) {
      if (!plan.isStatic && !plan.moduleId?.endsWith('.__vitepress_ssr.vue')) {
        continue
      }

      const sourceModuleId = path.resolve(siteConfig.srcDir, sourcePage)
      const canReuseArtifactModule = canReuseSsrPageArtifactWithPlugins(
        resolvedSsrArtifactPlugins,
        sourceModuleId
      )
      const needsCompiledAssetUrls =
        plan.isStatic &&
        compiler.resolvedConfig.experimental.renderBuiltUrl != null
      if (canReuseArtifactModule && !needsCompiledAssetUrls) {
        continue
      }

      ssrPageArtifacts.delete(createSsrPageArtifactModuleId(sourceModuleId))
      plan.moduleId = sourceModuleId
      plan.isStatic = false
    }

    const dynamicPageModules = [
      ...new Set(
        [...renderPagesBySource.values()]
          .map((page) => page.moduleId)
          .filter((moduleId): moduleId is string => !!moduleId)
      )
    ]
    await task(`compiling ${dynamicPageModules.length} SSR page modules`, () =>
      compiler.materializeGraphs(
        dynamicPageModules,
        siteConfig.buildConcurrency
      )
    )

    // Workers read an immutable request-key capability list instead of the
    // full-site manifest. Transformed module bodies remain deduplicated in the
    // shared CAS and are pulled lazily as ModuleRunner reaches them.
    for (const { offset, pages } of batches) {
      const entries = [
        ...new Set(
          pages
            .map((page) => renderPagesBySource.get(page)?.moduleId)
            .filter((moduleId): moduleId is string => !!moduleId)
        )
      ]
      const snapshotPath = path.join(
        moduleStorePath,
        'snapshots',
        `${offset}.json`
      )
      await compiler.writeSnapshotForEntries(entries, snapshotPath)
      batchModuleSnapshots.set(offset, snapshotPath)
    }
    builtins = compiler.getBuiltins()

    if (process.env.VITEPRESS_SSR_MEMORY_STATS) {
      const memory = process.memoryUsage()
      siteConfig.logger.info(
        `[ssr-compiler-memory] ${JSON.stringify({
          rssMiB: Math.round(memory.rss / 1024 / 1024),
          heapUsedMiB: Math.round(memory.heapUsed / 1024 / 1024),
          externalMiB: Math.round(memory.external / 1024 / 1024),
          ...compiler.getMemoryStats()
        })}`
      )
    }
  } finally {
    await compiler.close()
  }
  disposeBuildCaches()
  collectGarbageAtPhaseBoundary()

  const activeWorkers = Math.min(
    workerConcurrency,
    siteConfig.buildConcurrency,
    batches.length
  )
  const perWorkerRenderConcurrency = Math.max(
    1,
    Math.floor(siteConfig.buildConcurrency / activeWorkers)
  )
  await task(
    `rendering pages across ${batches.length} lightweight workers`,
    () =>
      forEachConcurrent(batches, activeWorkers, async ({ offset, pages }) => {
        const resultPath = path.join(coordinatorDir, `result-${offset}.bin`)
        const descriptorPath = path.join(
          coordinatorDir,
          `worker-${offset}.json`
        )
        const moduleSnapshotPath = batchModuleSnapshots.get(offset)
        if (!moduleSnapshotPath) {
          throw new Error(
            `Missing SSR module snapshot for render batch ${offset}.`
          )
        }
        const descriptor: SsrRenderWorkerDescriptor = {
          type: 'ssr-render',
          runtimePath: path.join(runtimeDir, 'app.js'),
          moduleStorePath,
          moduleSnapshotPath,
          builtins,
          resultPath,
          renderConcurrency: Math.min(perWorkerRenderConcurrency, pages.length),
          pages: await pMap(
            pages,
            async (sourcePage): Promise<SsrRenderWorkerPage> => {
              const plan = renderPagesBySource.get(sourcePage)
              if (!plan) {
                throw new Error(`Missing render descriptor for ${sourcePage}.`)
              }
              const { isStatic, ...descriptor } = plan
              if (!isStatic) return descriptor

              const artifact = await pageArtifactStore.getCurrent(
                descriptor.page
              )
              if (!artifact?.staticPage) {
                throw new Error(
                  `Missing static Markdown artifact for ${sourcePage}.`
                )
              }
              return {
                ...descriptor,
                staticPage: {
                  html:
                    artifact.staticHtml ??
                    prepareStaticHtmlForSsr(artifact.html),
                  pageData: artifact.pageData
                }
              }
            },
            { concurrency: perWorkerRenderConcurrency }
          )
        }

        try {
          await dispatchRenderWorker(descriptor, descriptorPath)
          const workerResult: unknown = deserialize(await readFile(resultPath))
          validateWorkerResult(workerResult, descriptor.pages)

          await pMap(
            workerResult.pages,
            (page) =>
              finalizeRenderedPage(
                deserializeRenderedPage(page),
                siteConfig,
                renderMetadata,
                pageToHashMap,
                metadataScript,
                additionalHeadTags,
                usedIcons
              ),
            {
              concurrency: perWorkerRenderConcurrency,
              stopOnError: false
            }
          )
        } finally {
          if (!process.env.DEBUG) {
            await Promise.all([
              unlink(descriptorPath).catch(() => {}),
              unlink(resultPath).catch(() => {}),
              unlink(moduleSnapshotPath).catch(() => {})
            ])
          }
        }

        collectGarbageAtPhaseBoundary()
        if (process.env.VITEPRESS_SSR_MEMORY_STATS) {
          const memory = process.memoryUsage()
          siteConfig.logger.info(
            `[ssr-memory] ${JSON.stringify({
              offset,
              rssMiB: Math.round(memory.rss / 1024 / 1024),
              heapUsedMiB: Math.round(memory.heapUsed / 1024 / 1024),
              externalMiB: Math.round(memory.external / 1024 / 1024)
            })}`
          )
        }
      })
  )

  return pageToHashMap
}

function createPageArtifactNamespace(
  siteConfig: SiteConfig,
  routeDigest: string,
  configDependencyDigest: string
): string {
  const digest = createHash('sha256')
  addDigestPart(digest, 'schema', 'vitepress-page-pipeline-v1')
  addDigestPart(digest, 'vitepress', version)
  addDigestPart(digest, 'routes', routeDigest)
  addDigestPart(
    digest,
    'config',
    stableSerialize(createPageArtifactConfigFingerprint(siteConfig))
  )
  addDigestPart(digest, 'configDependencies', configDependencyDigest)

  return digest.digest('hex')
}

function createPageArtifactConfigFingerprint(siteConfig: SiteConfig) {
  return {
    base: siteConfig.site.base,
    locales: siteConfig.site.locales,
    publicDir: siteConfig.publicDir,
    cleanUrls: siteConfig.cleanUrls,
    lastUpdated: siteConfig.lastUpdated,
    ignoreDeadLinks: siteConfig.ignoreDeadLinks,
    markdown: siteConfig.markdown,
    transformPageData: siteConfig.transformPageData,
    localSearchOptions:
      siteConfig.site.themeConfig?.search?.provider === 'local'
        ? siteConfig.site.themeConfig.search.options
        : undefined,
    vue: siteConfig.vue,
    vite: siteConfig.vite
  }
}

/** @internal */
export function resolvePageArtifactCachePolicy(
  siteConfig: SiteConfig,
  coordinatorDir: string
): { persistent: boolean; root: string } {
  const cacheKey = siteConfig.markdown?.cacheKey
  if (
    cacheKey !== undefined &&
    (typeof cacheKey !== 'string' || cacheKey.trim().length === 0)
  ) {
    throw new Error('markdown.cacheKey must be a non-empty string.')
  }

  const persistent =
    siteConfig.markdown?.cache !== false &&
    (cacheKey !== undefined ||
      isDeclarativeCacheInput(createPageArtifactConfigFingerprint(siteConfig)))

  return {
    persistent,
    root: persistent
      ? siteConfig.cacheDir
      : path.join(coordinatorDir, 'page-artifact-cache')
  }
}

function isDeclarativeCacheInput(
  value: unknown,
  ancestors = new Set<object>()
): boolean {
  if (
    value == null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint'
  ) {
    return true
  }
  if (typeof value !== 'object') return false
  if (value instanceof RegExp || value instanceof Date) return true
  if (ancestors.has(value)) return false

  ancestors.add(value)
  try {
    if (Array.isArray(value)) {
      return value.every((item) => isDeclarativeCacheInput(item, ancestors))
    }
    if (value instanceof Map) {
      return [...value].every(
        ([key, item]) =>
          isDeclarativeCacheInput(key, ancestors) &&
          isDeclarativeCacheInput(item, ancestors)
      )
    }
    if (value instanceof Set) {
      return [...value].every((item) =>
        isDeclarativeCacheInput(item, ancestors)
      )
    }

    const prototype = Object.getPrototypeOf(value)
    if (prototype !== Object.prototype && prototype !== null) return false
    return Object.values(value).every((item) =>
      isDeclarativeCacheInput(item, ancestors)
    )
  } finally {
    ancestors.delete(value)
  }
}

async function createConfigDependencyDigest(
  siteConfig: SiteConfig
): Promise<string> {
  const digest = createHash('sha256')
  const configFiles = [
    ...new Set(
      [
        siteConfig.configPath,
        ...siteConfig.configDeps,
        ...siteConfig.dynamicRoutes.map((route) => route.loaderPath)
      ].filter((file): file is string => !!file)
    )
  ].sort()
  for (const file of configFiles) {
    try {
      addDigestPart(digest, file, await readFile(file, 'utf8'))
    } catch (error) {
      addDigestPart(
        digest,
        file,
        `<${(error as NodeJS.ErrnoException).code || 'unreadable'}>`
      )
    }
  }
  return digest.digest('hex')
}

function addDigestPart(
  digest: ReturnType<typeof createHash>,
  key: string,
  value: string
) {
  digest.update(`${Buffer.byteLength(key)}:${key}`)
  digest.update(`${Buffer.byteLength(value)}:${value}`)
}

function stableSerialize(value: unknown, seen = new Set<object>()): string {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  if (typeof value === 'string') return JSON.stringify(value)
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  if (typeof value === 'bigint') return `${value}n`
  if (typeof value === 'symbol') return String(value)
  if (typeof value === 'function') return `function:${String(value)}`

  if (seen.has(value)) return '[Circular]'
  seen.add(value)
  try {
    if (value instanceof RegExp) return `regexp:${String(value)}`
    if (value instanceof Date) return `date:${value.toISOString()}`
    if (Array.isArray(value)) {
      return `[${value.map((item) => stableSerialize(item, seen)).join(',')}]`
    }
    if (value instanceof Map) {
      return `map:{${[...value]
        .map(
          ([key, item]) =>
            `${stableSerialize(key, seen)}:${stableSerialize(item, seen)}`
        )
        .sort()
        .join(',')}}`
    }
    if (value instanceof Set) {
      return `set:[${[...value]
        .map((item) => stableSerialize(item, seen))
        .sort()
        .join(',')}]`
    }

    const record = value as Record<string, unknown>
    return `${value.constructor?.name || 'Object'}:{${Object.keys(record)
      .sort()
      .map(
        (key) => `${JSON.stringify(key)}:${stableSerialize(record[key], seen)}`
      )
      .join(',')}}`
  } finally {
    seen.delete(value)
  }
}

async function linkVue() {
  const root = await packageDirectory()
  if (root) {
    const dest = path.resolve(root, 'node_modules/vue')
    // If the user did not install Vue, link VitePress' copy.
    if (!fs.existsSync(dest)) {
      const src = path.dirname(createRequire(import.meta.url).resolve('vue'))
      await mkdir(path.dirname(dest), { recursive: true })
      await symlink(src, dest, 'junction')
      return () => unlink(dest)
    }
  }
  return async () => {}
}
