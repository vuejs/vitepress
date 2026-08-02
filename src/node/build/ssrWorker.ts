import { readFile, writeFile } from 'node:fs/promises'
import pMap from 'p-map'
import { createNodeImportMeta, ModuleRunner } from 'vite/module-runner'
import { notFoundPageData, type PageData, type SSGContext } from '../shared'
import { nativeImport } from '../utils/nativeImport'
import type { SerializedRenderedPage, SerializedSSGContext } from './render'
import {
  serializeSsrRenderWorkerResult,
  type SsrRenderWorkerDescriptor,
  type SsrRenderWorkerResult
} from './ssrWorkerProtocol'
import { SsrModuleArtifactTransport } from './ssrModuleTransport'

interface RuntimeModule {
  renderPage(path: string, pageModule: unknown): Promise<SSGContext>
}

interface LoadedPageModule {
  default?: unknown
  __pageData?: PageData
}

function serializeContext(context: SSGContext): SerializedSSGContext {
  const serialized = {
    ...context,
    vpSocialIcons: [...context.vpSocialIcons].sort()
  } as SerializedSSGContext & {
    __teleportBuffers?: unknown
    __watcherHandles?: unknown
  }

  // Vue leaves private data in SSRContext after rendering. Watcher handles
  // contain functions that V8 cannot serialize. Teleport buffers are not
  // necessary after `renderToString` creates the public output.
  delete serialized.__teleportBuffers
  delete serialized.__watcherHandles
  return serialized
}

function validatePageModule(
  pageModule: LoadedPageModule,
  moduleId: string
): asserts pageModule is LoadedPageModule & {
  default: NonNullable<unknown>
  __pageData: PageData
} {
  if (!pageModule.default) {
    throw new Error(
      `SSR page module ${moduleId} has no default component export.`
    )
  }
  if (!pageModule.__pageData) {
    throw new Error(`SSR page module ${moduleId} did not export __pageData.`)
  }
}

async function renderBatch(
  descriptor: SsrRenderWorkerDescriptor
): Promise<SsrRenderWorkerResult> {
  const runtime = (await nativeImport(descriptor.runtimePath)) as RuntimeModule
  if (typeof runtime.renderPage !== 'function') {
    throw new Error(
      `Shared SSR runtime at ${descriptor.runtimePath} does not export renderPage().`
    )
  }

  const needsModuleRunner = descriptor.pages.some(
    (page) => page.moduleId && !page.staticPage
  )
  const runner = needsModuleRunner
    ? new ModuleRunner({
        transport: new SsrModuleArtifactTransport(
          descriptor.moduleStorePath,
          descriptor.builtins,
          descriptor.moduleSnapshotPath
        ),
        hmr: false,
        createImportMeta: createNodeImportMeta,
        sourcemapInterceptor: false
      })
    : undefined
  try {
    const pages = await pMap(
      descriptor.pages,
      async (page): Promise<SerializedRenderedPage> => {
        try {
          const pageModule = page.staticPage
            ? null
            : page.moduleId
              ? ((await runner!.import(page.moduleId)) as LoadedPageModule)
              : null
          if (pageModule && page.moduleId) {
            validatePageModule(pageModule, page.moduleId)
          }

          const payload = page.staticPage ?? pageModule
          const context = await runtime.renderPage(page.routePath, payload)
          const pageData =
            page.staticPage?.pageData ??
            pageModule?.__pageData ??
            (page.page === '404.md' ? notFoundPageData : undefined)

          if (!pageData) {
            throw new Error(
              `SSR page ${page.page} has neither a static payload nor a page-data module.`
            )
          }

          return {
            page: page.page,
            pageData,
            hasCustom404: page.page !== '404.md' || payload !== null,
            context: serializeContext(context)
          }
        } catch (error) {
          const detail =
            error instanceof Error
              ? (error.stack ?? error.message)
              : String(error)
          throw new Error(
            `Failed to render ${page.page} in SSR worker: ${detail}`,
            { cause: error }
          )
        }
      },
      {
        concurrency: descriptor.renderConcurrency,
        // Keep the shared ModuleRunner open while another mapper imports or
        // renders. If a page fails, p-map reports the errors after the batch
        // finishes.
        stopOnError: false
      }
    )
    return { pages }
  } finally {
    await runner?.close()
  }
}

async function main(): Promise<void> {
  const descriptorPath = process.argv[2]
  if (!descriptorPath) {
    throw new Error('Missing SSR worker descriptor path.')
  }

  const descriptor = JSON.parse(
    await readFile(descriptorPath, 'utf8')
  ) as SsrRenderWorkerDescriptor
  if (descriptor.type !== 'ssr-render') {
    throw new Error('Unknown SSR worker descriptor type.')
  }

  const result = await renderBatch(descriptor)
  await writeFile(
    descriptor.resultPath,
    serializeSsrRenderWorkerResult(result),
    { mode: 0o600 }
  )
}

main().catch((error) => {
  console.error(error instanceof Error ? error : new Error(String(error)))
  process.exitCode = 1
})
