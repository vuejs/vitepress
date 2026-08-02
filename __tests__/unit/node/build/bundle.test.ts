import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import {
  captureClientAssetUrls,
  collectSsrRuntimeBridges,
  createSsrRuntimeBridgePlugin,
  createSsrRuntimeInput
} from 'node/build/bundle'
import type { SiteConfig } from 'node/config'
import {
  build as viteBuild,
  normalizePath,
  type Plugin,
  type ResolvedConfig,
  type Rolldown
} from 'vite'

function assetCaptureTransform(assetMap: Record<string, string>) {
  const plugin = captureClientAssetUrls(
    { site: { base: '/' } } as SiteConfig,
    assetMap
  )
  const transform = plugin.transform as {
    handler(code: string, id: string): void
  }
  return transform.handler
}

test('captures inlined assets without treating raw or arbitrary root strings as URLs', () => {
  const assetMap: Record<string, string> = Object.create(null)
  const transform = assetCaptureTransform(assetMap)

  transform('export default "data:image/png;base64,cGl4ZWw="', '/logo.png')
  transform('export default "data:not-an-asset"', '/message.txt?raw')
  transform('export default "/arbitrary-string"', '/message.txt?custom')

  expect(assetMap['/logo.png']).toBe('data:image/png;base64,cGl4ZWw=')
  expect(assetMap['/message.txt?raw']).toBeUndefined()
  expect(assetMap['/message.txt?custom']).toBeUndefined()
})

test('rejects runtime renderBuiltUrl expressions for batched SSR assets', () => {
  const assetMap: Record<string, string> = Object.create(null)
  const plugin = captureClientAssetUrls(
    { site: { base: '/' } } as SiteConfig,
    assetMap
  )
  const configResolved = plugin.configResolved as (
    config: ResolvedConfig
  ) => void
  configResolved({
    experimental: {
      renderBuiltUrl() {
        return { runtime: 'globalThis.__assetUrl' }
      }
    }
  } as ResolvedConfig)

  const transform = plugin.transform as {
    handler(code: string, id: string): void
  }
  const assetId = '/logo.svg?url'
  transform.handler('export default "__VITE_ASSET__logo__"', assetId)

  const generateBundle = plugin.generateBundle as (
    this: Rolldown.PluginContext,
    options: Rolldown.NormalizedOutputOptions,
    bundle: Rolldown.OutputBundle
  ) => void
  expect(() =>
    generateBundle.call(
      {
        getFileName() {
          return 'assets/logo.svg'
        }
      } as unknown as Rolldown.PluginContext,
      {} as Rolldown.NormalizedOutputOptions,
      {
        'page.js': {
          type: 'chunk',
          moduleIds: [assetId],
          fileName: 'page.js'
        }
      } as Rolldown.OutputBundle
    )
  ).toThrow(
    'ssrBuildBatchSize cannot materialize the runtime renderBuiltUrl expression for assets/logo.svg. Return a URL string for SSR assets instead.'
  )
})

function invokeModuleParsed(
  plugin: Plugin,
  moduleInfo: Pick<Rolldown.ModuleInfo, 'id' | 'isEntry'> &
    Partial<Rolldown.ModuleInfo>,
  emitFile: (file: Rolldown.EmittedFile) => string
) {
  const handler = plugin.moduleParsed as (
    this: Rolldown.PluginContext,
    moduleInfo: Rolldown.ModuleInfo
  ) => void
  handler.call(
    { emitFile } as unknown as Rolldown.PluginContext,
    {
      importers: [],
      dynamicImporters: [],
      importedIds: [],
      dynamicallyImportedIds: [],
      ...moduleInfo
    } as Rolldown.ModuleInfo
  )
}

async function invokeBuildStart(plugin: Plugin, resolvedId: string) {
  const handler = plugin.buildStart as (
    this: Rolldown.PluginContext
  ) => Promise<void>
  const resolve = vi.fn(
    async () => ({ id: resolvedId, external: false }) as Rolldown.ResolvedId
  )
  await handler.call({
    resolve,
    error(message: string | Rolldown.RollupError): never {
      throw new Error(typeof message === 'string' ? message : message.message)
    }
  } as unknown as Rolldown.PluginContext)
  return resolve
}

test('declares only runtime roots instead of every file in a custom theme', () => {
  const bridgeModuleIds = new Set<string>()
  const input = createSsrRuntimeInput(
    {
      themeDir: path.join(process.cwd(), 'site/.vitepress/theme')
    } as SiteConfig,
    bridgeModuleIds
  )

  expect(input).toMatchObject({
    app: expect.any(String),
    vitepress: expect.any(String),
    theme: expect.any(String),
    'site-theme': '@theme/index'
  })
  expect(Object.keys(input)).toEqual([
    'app',
    'vitepress',
    'theme',
    'site-theme'
  ])
  expect([...bridgeModuleIds].sort()).toEqual(
    [normalizePath(input.vitepress), normalizePath(input.theme)].sort()
  )
})

test('emits bounded facades for all site-local and virtual theme dependencies', async () => {
  const themeDir = path.join(process.cwd(), 'site/.vitepress/theme')
  const indexId = normalizePath(path.join(themeDir, 'index.ts'))
  const componentId = normalizePath(
    path.join(themeDir, 'components/Widget.vue')
  )
  const componentScriptId = `${componentId}?vue&type=script&lang.ts`
  const componentStyleId = `${componentId}?vue&type=style&index=0&lang.css`
  const sharedId = normalizePath(path.join(themeDir, '../../shared/state.ts'))
  const virtualId = '\0test:theme-singleton'
  const virtualAssetId = '\0test:theme-logo.svg'
  const customAssetId = '\0test:custom-asset'
  const dependencyId = normalizePath(
    path.join(process.cwd(), 'node_modules/example/index.js')
  )
  const nativeId = 'node:crypto'
  const bridgeModuleIds = new Set<string>()
  const plugin = createSsrRuntimeBridgePlugin({ themeDir }, bridgeModuleIds)
  const emitFile = vi.fn((_file: Rolldown.EmittedFile) => 'bridge')

  const resolve = await invokeBuildStart(plugin, indexId)
  // A source may be parsed first through another runtime entry. The final
  // bridge set must not depend on Rolldown's traversal order.
  invokeModuleParsed(plugin, { id: sharedId, isEntry: false }, emitFile)
  invokeModuleParsed(plugin, { id: virtualId, isEntry: false }, emitFile)
  invokeModuleParsed(
    plugin,
    {
      id: indexId,
      isEntry: true,
      importedIds: [
        componentId,
        virtualId,
        virtualAssetId,
        customAssetId,
        dependencyId,
        nativeId
      ]
    },
    emitFile
  )
  invokeModuleParsed(
    plugin,
    {
      id: componentId,
      isEntry: false,
      importedIds: [componentScriptId, componentStyleId]
    },
    emitFile
  )
  invokeModuleParsed(plugin, { id: componentId, isEntry: false }, emitFile)
  invokeModuleParsed(
    plugin,
    {
      id: componentScriptId,
      isEntry: false,
      importedIds: [sharedId]
    },
    emitFile
  )
  invokeModuleParsed(plugin, { id: componentStyleId, isEntry: false }, emitFile)
  invokeModuleParsed(plugin, { id: virtualAssetId, isEntry: false }, emitFile)
  invokeModuleParsed(
    plugin,
    {
      id: customAssetId,
      isEntry: false,
      meta: { 'vite:asset': true }
    },
    emitFile
  )
  invokeModuleParsed(plugin, { id: dependencyId, isEntry: false }, emitFile)
  invokeModuleParsed(plugin, { id: nativeId, isEntry: false }, emitFile)
  invokeModuleParsed(
    plugin,
    {
      id: normalizePath(path.join(themeDir, 'ambient.d.ts')),
      isEntry: false
    },
    emitFile
  )
  invokeModuleParsed(
    plugin,
    { id: `${componentId}?vue&type=style`, isEntry: false },
    emitFile
  )
  invokeModuleParsed(
    plugin,
    {
      id: normalizePath(path.join(themeDir, '../theme-story/Story.ts')),
      isEntry: false
    },
    emitFile
  )

  expect(resolve).toHaveBeenCalledWith('@theme/index', undefined, {
    isEntry: true
  })
  expect([...bridgeModuleIds].sort()).toEqual(
    [indexId, componentId, sharedId, virtualId].sort()
  )
  expect(emitFile).toHaveBeenCalledTimes(3)
  for (const id of [componentId, sharedId, virtualId]) {
    expect(emitFile).toHaveBeenCalledWith({
      type: 'chunk',
      id,
      name: expect.stringMatching(/^site-runtime-[a-f\d]{16}$/),
      preserveSignature: 'strict'
    })
  }
})

test('runtime facades preserve local and virtual singleton identity', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'vitepress-runtime-bridge-'))
  const themeDir = path.join(root, '.vitepress/theme')
  const dependencyDir = path.join(root, 'node_modules/runtime-dependency')
  const outDir = path.join(root, 'out')
  const appId = path.join(root, 'app.js')
  const themeId = path.join(themeDir, 'index.js')
  const sharedId = path.join(root, 'shared.js')
  const virtualId = '\0test:virtual-singleton'

  try {
    await Promise.all([
      mkdir(themeDir, { recursive: true }),
      mkdir(dependencyDir, { recursive: true })
    ])
    await Promise.all([
      writeFile(appId, `export * from '@theme/index'`),
      writeFile(
        themeId,
        [
          `export { localSingleton } from '../../shared.js'`,
          `export { virtualSingleton } from 'virtual:singleton'`,
          `export { dependencySingleton } from 'runtime-dependency'`,
          `export { types as nativeTypes } from 'node:util'`
        ].join('\n')
      ),
      writeFile(sharedId, `export const localSingleton = { local: true }`),
      writeFile(
        path.join(dependencyDir, 'package.json'),
        JSON.stringify({ type: 'module', exports: './index.js' })
      ),
      writeFile(
        path.join(dependencyDir, 'index.js'),
        `export const dependencySingleton = { dependency: true }`
      )
    ])

    const bridgeModuleIds = new Set<string>()
    const result = (await viteBuild({
      root,
      configFile: false,
      logLevel: 'silent',
      resolve: {
        alias: { '@theme/index': themeId }
      },
      plugins: [
        {
          name: 'test:virtual-singleton',
          resolveId(id) {
            if (id === 'virtual:singleton') return virtualId
          },
          load(id) {
            if (id === virtualId) {
              return `export const virtualSingleton = { virtual: true }`
            }
          }
        },
        createSsrRuntimeBridgePlugin({ themeDir }, bridgeModuleIds)
      ],
      build: {
        ssr: true,
        outDir,
        minify: false,
        rolldownOptions: {
          input: { app: appId, 'site-theme': '@theme/index' },
          preserveEntrySignatures: 'strict',
          output: {
            entryFileNames: '[name].mjs',
            chunkFileNames: 'chunks/[name]-[hash].mjs'
          }
        }
      }
    })) as Rolldown.RolldownOutput

    const normalizedThemeId = [...bridgeModuleIds].find((id) =>
      id.endsWith('/.vitepress/theme/index.js')
    )
    const normalizedSharedId = [...bridgeModuleIds].find((id) =>
      id.endsWith('/shared.js')
    )
    expect(normalizedThemeId).toBeDefined()
    expect(normalizedSharedId).toBeDefined()
    expect([...bridgeModuleIds].sort()).toEqual(
      [normalizedThemeId!, normalizedSharedId!, virtualId].sort()
    )

    const bridges = collectSsrRuntimeBridges(result, outDir, bridgeModuleIds)
    const appChunk = result.output.find(
      (output): output is Rolldown.OutputChunk =>
        output.type === 'chunk' && output.isEntry && output.name === 'app'
    )
    expect(appChunk).toBeDefined()

    const externalImports = result.output.flatMap((output) =>
      output.type === 'chunk' ? output.imports : []
    )
    expect(externalImports).toContain('runtime-dependency')
    expect(externalImports).toContain('node:util')

    const runtime = await import(
      pathToFileURL(path.resolve(outDir, appChunk!.fileName)).href
    )
    const localBridge = await import(
      pathToFileURL(bridges[normalizedSharedId!]).href
    )
    const virtualBridge = await import(pathToFileURL(bridges[virtualId]).href)

    expect(runtime.localSingleton).toBe(localBridge.localSingleton)
    expect(runtime.virtualSingleton).toBe(virtualBridge.virtualSingleton)
    expect(runtime.dependencySingleton.dependency).toBe(true)
    expect(runtime.nativeTypes.isNativeError).toBeTypeOf('function')
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('collects only recorded runtime facades and rejects missing ones', () => {
  const outDir = path.join(process.cwd(), '.temp/runtime')
  const vitepressId = normalizePath(path.join(process.cwd(), 'client/index.js'))
  const themeId = normalizePath(path.join(process.cwd(), 'theme/index.ts'))
  const unrelatedId = normalizePath(
    path.join(process.cwd(), 'theme/Widget.story.ts')
  )
  const result = {
    output: [
      {
        type: 'chunk',
        isEntry: true,
        name: 'vitepress',
        facadeModuleId: vitepressId,
        fileName: 'vitepress.js'
      },
      {
        type: 'chunk',
        isEntry: true,
        name: 'site-theme',
        facadeModuleId: themeId,
        fileName: 'site-theme.js'
      },
      {
        type: 'chunk',
        isEntry: true,
        name: 'unrelated',
        facadeModuleId: unrelatedId,
        fileName: 'unrelated.js'
      }
    ]
  } as unknown as Rolldown.RolldownOutput

  const bridges = collectSsrRuntimeBridges(
    result,
    outDir,
    new Set([vitepressId, themeId])
  )
  expect(bridges).toEqual({
    [vitepressId]: path.resolve(outDir, 'vitepress.js'),
    [themeId]: path.resolve(outDir, 'site-theme.js')
  })
  expect(bridges[unrelatedId]).toBeUndefined()

  const missingId = normalizePath(path.join(process.cwd(), 'theme/missing.ts'))
  expect(() =>
    collectSsrRuntimeBridges(
      result,
      outDir,
      new Set([vitepressId, themeId, missingId])
    )
  ).toThrow(missingId)
})
