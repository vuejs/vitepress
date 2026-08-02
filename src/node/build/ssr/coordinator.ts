import { mkdir, mkdtemp, readFile, unlink } from 'node:fs/promises'
import path from 'node:path'
import { deserialize } from 'node:v8'
import pMap from 'p-map'
import type { BuildOptions } from 'vite'
import type { SiteConfig } from '../../config'
import { PageArtifactStore } from '../artifacts/store'
import type { PageMeta } from '../../plugin'
import { task } from '../../utils/task'
import { collectGarbageAtPhaseBoundary, disposeBuildCaches } from '../cache'
import { bundle, createViteBuildConfig } from '../bundle'
import { finalizeRenderedPage } from '../render/finalize'
import { prepareRenderInputs } from '../render/metadata'
import { deserializeRenderedPage } from '../render/page'
import { createSsrModuleCompiler } from './modules/compiler'
import {
  createRenderQueue,
  createSsrBatchPlan,
  type SsrBatchOptions
} from './options'
import { SsrRenderWorkerPool } from './worker/pool'
import {
  validateSsrRenderWorkerResult,
  type SsrRenderWorkerDescriptor,
  type SsrRenderWorkerPage
} from './worker/protocol'

interface ClientPhaseResult {
  clientAssetMap: Record<string, string>
  pageToHashMap: Record<string, string>
  renderInputs: Awaited<ReturnType<typeof prepareRenderInputs>>
}

export async function buildWithBatchedSsr(
  siteConfig: SiteConfig,
  buildOptions: BuildOptions,
  pageMetaMap: Record<string, PageMeta>,
  usedIcons: Set<string>,
  options: SsrBatchOptions
): Promise<Record<string, string>> {
  await mkdir(siteConfig.tempDir, { recursive: true })
  const coordinatorDir = await mkdtemp(
    path.join(siteConfig.tempDir, 'ssr-coordinator-')
  )
  const artifactStore = new PageArtifactStore(
    path.join(coordinatorDir, 'page-artifacts')
  )

  const client = await task(
    'compiling Markdown and building client bundle',
    () => buildClientPhase(siteConfig, buildOptions, pageMetaMap, artifactStore)
  )
  disposeBuildCaches()
  collectGarbageAtPhaseBoundary()

  const runtimeDir = path.join(coordinatorDir, 'runtime')
  const runtimeBridges = await task('building shared SSR runtime', async () => {
    const result = await bundle(siteConfig, buildOptions, undefined, {
      mode: 'ssr-runtime',
      outDir: runtimeDir,
      clientAssetMap: client.clientAssetMap
    })
    return result.ssrRuntimeBridgeMap
  })
  disposeBuildCaches()
  collectGarbageAtPhaseBoundary()

  const renderQueue = createRenderQueue(siteConfig.pages)
  const sourcePages = new Set(siteConfig.pages)
  const renderPlans = new Map<string, SsrRenderWorkerPage>()
  for (const sourcePage of renderQueue) {
    const page = siteConfig.rewrites.map[sourcePage] || sourcePage
    renderPlans.set(sourcePage, {
      page,
      routePath: `/${page.replace(/\.md$/, '')}`,
      moduleId: sourcePages.has(sourcePage)
        ? path.resolve(siteConfig.srcDir, sourcePage)
        : null
    })
  }

  const ssrConfig = await createViteBuildConfig(siteConfig, buildOptions, {
    ssr: true,
    pages: [],
    outDir: path.join(coordinatorDir, 'page-compiler'),
    isolatedSsr: true,
    vitePressPluginOptions: {
      pageArtifactStore: artifactStore,
      skipGitScan: true
    }
  })
  const moduleStorePath = path.join(coordinatorDir, 'ssr-modules')
  const batches = createSsrBatchPlan(renderQueue, options.batchSize)
  const batchModuleSnapshots = new Map<number, string>()
  const compiler = createSsrModuleCompiler(ssrConfig, moduleStorePath, {
    runtimeBridges: new Map(Object.entries(runtimeBridges)),
    resolveAsset: client.clientAssetMap
  })

  let builtins: ReturnType<typeof compiler.getBuiltins> = []
  try {
    await compiler.init()
    const moduleIds = [
      ...new Set(
        [...renderPlans.values()]
          .map((page) => page.moduleId)
          .filter((id): id is string => id !== null)
      )
    ]
    await task(`compiling ${moduleIds.length} SSR page modules`, () =>
      compiler.materializeGraphs(moduleIds, siteConfig.buildConcurrency)
    )

    for (const { offset, pages } of batches) {
      const entries = pages
        .map((page) => renderPlans.get(page)?.moduleId)
        .filter((id): id is string => id != null)
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
    options.workerConcurrency,
    siteConfig.buildConcurrency,
    batches.length
  )
  const perWorkerRenderConcurrency = Math.max(
    1,
    Math.floor(siteConfig.buildConcurrency / activeWorkers)
  )
  const pool = new SsrRenderWorkerPool()
  try {
    await task(
      `rendering pages across ${batches.length} lightweight workers`,
      () =>
        pMap(
          batches,
          async ({ offset, pages }) => {
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

            const workerPages = pages.map((sourcePage) => {
              const plan = renderPlans.get(sourcePage)
              if (!plan) {
                throw new Error(`Missing render descriptor for ${sourcePage}.`)
              }
              return plan
            })
            const descriptor: SsrRenderWorkerDescriptor = {
              type: 'ssr-render',
              runtimePath: path.join(runtimeDir, 'app.js'),
              moduleStorePath,
              moduleSnapshotPath,
              builtins,
              resultPath,
              renderConcurrency: Math.min(
                perWorkerRenderConcurrency,
                pages.length
              ),
              pages: workerPages
            }

            try {
              await pool.run(descriptor, descriptorPath)
              const workerResult: unknown = deserialize(
                await readFile(resultPath)
              )
              validateSsrRenderWorkerResult(workerResult, descriptor.pages)
              await pMap(
                workerResult.pages,
                (page) =>
                  finalizeRenderedPage(
                    deserializeRenderedPage(page),
                    siteConfig,
                    client.renderInputs.renderMetadata,
                    client.pageToHashMap,
                    client.renderInputs.metadataScript,
                    client.renderInputs.additionalHeadTags,
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
          },
          { concurrency: activeWorkers }
        )
    )
  } finally {
    await pool.dispose()
  }

  return client.pageToHashMap
}

async function buildClientPhase(
  siteConfig: SiteConfig,
  buildOptions: BuildOptions,
  pageMetaMap: Record<string, PageMeta>,
  pageArtifactStore: PageArtifactStore
): Promise<ClientPhaseResult> {
  const result = await bundle(siteConfig, buildOptions, pageMetaMap, {
    mode: 'client',
    vitePressPluginOptions: {
      coordinatorClient: true,
      pageArtifactStore,
      skipGitScan: true
    }
  })
  await pageArtifactStore.flush()
  return {
    clientAssetMap: result.clientAssetMap,
    pageToHashMap: result.pageToHashMap,
    renderInputs: await prepareRenderInputs(
      siteConfig,
      result.clientResult,
      null,
      result.pageToHashMap
    )
  }
}
