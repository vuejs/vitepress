import {
  createSsrModuleCompiler,
  type SsrModuleCompiler
} from 'node/build/ssr/modules/compiler'
import { SsrModuleArtifactTransport } from 'node/build/ssr/modules/transport'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { perEnvironmentState, type Plugin } from 'vite'
import { createNodeImportMeta, ModuleRunner } from 'vite/module-runner'

describe('SsrModuleCompiler', () => {
  let root: string | undefined
  const compilers = new Set<SsrModuleCompiler>()

  afterEach(async () => {
    await Promise.all([...compilers].map((compiler) => compiler.close()))
    compilers.clear()
    if (root) {
      await rm(root, { recursive: true, force: true })
      root = undefined
    }
  })

  async function createFixture() {
    root = await mkdtemp(path.join(tmpdir(), 'vitepress-ssr-modules-'))
    await writeFile(
      path.join(root, 'package.json'),
      JSON.stringify({ type: 'module' })
    )
    return {
      root,
      artifactDir: path.join(root, '.artifacts')
    }
  }

  test('materializes final asset URLs and externalizes shared runtime bridges', async () => {
    const fixture = await createFixture()
    const bridge = path.join(fixture.root, 'runtime-bridge.mjs')
    await writeFile(bridge, 'export const shared = true')

    const compiler = createSsrModuleCompiler(
      {
        root: fixture.root,
        logLevel: 'silent',
        plugins: [
          {
            name: 'test:resolve-runtime-bridge',
            resolveId(id) {
              if (id === 'virtual:runtime') return '\0test:runtime'
              if (id === 'virtual:runtime?raw') return '\0test:runtime?raw'
            },
            load(id) {
              if (id === '\0test:runtime?raw') {
                return 'export default "raw-runtime-source"'
              }
            }
          }
        ]
      },
      fixture.artifactDir,
      {
        runtimeBridges: new Map([['\0test:runtime', bridge]]),
        resolveAsset: new Map([
          ['virtual:logo', '/assets/logo.content-hash.svg']
        ])
      }
    )
    compilers.add(compiler)
    await compiler.init()

    await expect(compiler.handleFetch(['virtual:runtime'])).resolves.toEqual({
      externalize: pathToFileURL(bridge).href,
      type: 'module'
    })

    const queriedRuntime = await compiler.handleFetch(['virtual:runtime?raw'])
    expect('externalize' in queriedRuntime).toBe(false)
    expect('code' in queriedRuntime).toBe(true)
    if ('code' in queriedRuntime) {
      expect(queriedRuntime.code).toContain('raw-runtime-source')
    }

    const asset = await compiler.handleFetch(['virtual:logo'])
    expect('cache' in asset).toBe(false)
    expect('code' in asset).toBe(true)
    if ('code' in asset) {
      expect(asset.code).toContain('/assets/logo.content-hash.svg')
      expect(asset.code).not.toContain('/@fs/')
      expect(asset.invalidate).toBe(false)
    }
  })

  test('runs SSR plugin buildStart hooks before transforming modules', async () => {
    const fixture = await createFixture()
    let initialized = false
    const compiler = createSsrModuleCompiler(
      {
        root: fixture.root,
        logLevel: 'silent',
        plugins: [
          {
            name: 'test:ssr-build-start',
            buildStart() {
              initialized = true
            },
            resolveId(id) {
              if (id === 'virtual:after-build-start') {
                return '\0test:after-build-start'
              }
            },
            load(id) {
              if (id !== '\0test:after-build-start') return
              if (!initialized) throw new Error('buildStart did not run')
              return 'export const initialized = true'
            }
          }
        ]
      },
      fixture.artifactDir
    )
    compilers.add(compiler)
    await compiler.init()

    const result = await compiler.precompile('virtual:after-build-start')
    expect(initialized).toBe(true)
    expect('code' in result && result.code).toContain('initialized')
  })

  test('presents production non-watch semantics to user plugin hooks', async () => {
    const fixture = await createFixture()
    const observations: {
      hook: string
      mode: string
      watchMode: boolean
    }[] = []
    const environments = new Set<object>()
    const environmentState = perEnvironmentState(() => ({
      hooks: [] as string[]
    }))
    let sharedEnvironmentState: { hooks: string[] } | undefined
    let sawBuildContextSurface = false
    let readModuleMeta = false
    const observe = (
      hook: string,
      context: {
        environment: { mode: string }
        meta: { watchMode: boolean }
      }
    ) => {
      const state = environmentState(context as never)
      sharedEnvironmentState ||= state
      expect(state).toBe(sharedEnvironmentState)
      state.hooks.push(hook)
      environments.add(context.environment)
      observations.push({
        hook,
        mode: context.environment.mode,
        watchMode: context.meta.watchMode
      })
    }
    let readCombinedSourcemap = false
    const compiler = createSsrModuleCompiler(
      {
        root: fixture.root,
        logLevel: 'silent',
        plugins: [
          {
            name: 'test:ssr-build-context',
            options(options) {
              observe('options', this)
              expect(this.emitFile).toBeUndefined()
              expect(this.getFileName).toBeUndefined()
              expect(this.getModuleInfo).toBeUndefined()
              expect(this.getModuleIds).toBeUndefined()
              return options
            },
            buildStart() {
              observe('buildStart', this)
            },
            resolveId(id) {
              if (id !== 'virtual:build-context') return
              observe('resolveId', this)
              return '\0test:build-context'
            },
            load(id) {
              if (id !== '\0test:build-context') return
              observe('load', this)
              return 'export const context = true'
            },
            transform(code, id) {
              if (id !== '\0test:build-context') return
              observe('transform', this)
              sawBuildContextSurface =
                typeof this.emitFile === 'function' &&
                typeof this.getFileName === 'function' &&
                typeof this.getModuleInfo === 'function' &&
                typeof this.getModuleIds === 'function' &&
                this.setAssetSource === undefined &&
                this.getWatchFiles === undefined
              readModuleMeta = this.getModuleInfo(id)?.meta != null
              this.getCombinedSourcemap()
              readCombinedSourcemap = true
              return code
            },
            buildEnd() {
              observe('buildEnd', this)
            },
            closeBundle() {
              observe('closeBundle', this)
            }
          }
        ]
      },
      fixture.artifactDir
    )
    compilers.add(compiler)
    await compiler.init()
    await compiler.precompile('virtual:build-context')
    await compiler.close()

    expect(readCombinedSourcemap).toBe(true)
    expect(readModuleMeta).toBe(true)
    expect(sawBuildContextSurface).toBe(true)
    expect(environments.size).toBe(1)
    expect(observations.map(({ hook }) => hook)).toEqual([
      'options',
      'buildStart',
      'resolveId',
      'load',
      'transform',
      'buildEnd',
      'closeBundle'
    ])
    expect(
      observations.every(
        ({ mode, watchMode }) => mode === 'build' && watchMode === false
      )
    ).toBe(true)
    expect(sharedEnvironmentState?.hooks).toEqual(
      observations.map(({ hook }) => hook)
    )
  })

  test('rejects Rolldown-only context methods instead of ignoring them', async () => {
    const fixture = await createFixture()
    const compiler = createSsrModuleCompiler(
      {
        root: fixture.root,
        logLevel: 'silent',
        plugins: [
          {
            name: 'test:ssr-emit-file',
            resolveId(id) {
              if (id === 'virtual:emit-file') return '\0test:emit-file'
            },
            load(id) {
              if (id !== '\0test:emit-file') return
              this.emitFile({
                type: 'asset',
                name: 'server-only.txt',
                source: 'server-only'
              })
              return 'export const emitted = true'
            }
          }
        ]
      },
      fixture.artifactDir
    )
    compilers.add(compiler)
    await compiler.init()

    await expect(compiler.precompile('virtual:emit-file')).rejects.toThrow(
      'plugin "test:ssr-emit-file" called this.emitFile()'
    )
  })

  test('runs supported plugin teardown hooks when closing', async () => {
    const fixture = await createFixture()
    const lifecycle: string[] = []
    const compiler = createSsrModuleCompiler(
      {
        root: fixture.root,
        logLevel: 'silent',
        plugins: [
          {
            name: 'test:ssr-teardown-lifecycle',
            buildEnd() {
              lifecycle.push('buildEnd')
            },
            closeBundle() {
              lifecycle.push('closeBundle')
            }
          }
        ]
      },
      fixture.artifactDir
    )
    compilers.add(compiler)
    await compiler.init()

    await compiler.close()
    expect(lifecycle).toEqual(['buildEnd', 'closeBundle'])
  })

  test('propagates plugin teardown errors after closing the environment', async () => {
    const fixture = await createFixture()
    const compiler = createSsrModuleCompiler(
      {
        root: fixture.root,
        logLevel: 'silent',
        plugins: [
          {
            name: 'test:ssr-teardown-error',
            closeBundle() {
              throw new Error('SSR teardown failed')
            }
          }
        ]
      },
      fixture.artifactDir
    )
    compilers.add(compiler)
    await compiler.init()

    const environment = (
      compiler as unknown as {
        environment: { close: () => Promise<void> }
      }
    ).environment
    const closeEnvironment = vi.spyOn(environment, 'close')

    await expect(compiler.close()).rejects.toThrow('SSR teardown failed')
    expect(closeEnvironment).toHaveBeenCalledOnce()
  })

  test('rejects output hooks before starting the unbundled page environment', async () => {
    const fixture = await createFixture()
    const compiler = createSsrModuleCompiler(
      {
        root: fixture.root,
        logLevel: 'silent',
        plugins: [
          {
            name: 'test:ssr-page-output',
            renderChunk(code) {
              return code
            }
          }
        ]
      },
      fixture.artifactDir
    )
    compilers.add(compiler)

    await expect(compiler.init()).rejects.toThrow(
      'plugin "test:ssr-page-output": renderChunk'
    )
  })

  test('rejects output hooks from build.rolldownOptions.plugins once', async () => {
    const fixture = await createFixture()
    const compiler = createSsrModuleCompiler(
      {
        root: fixture.root,
        logLevel: 'silent',
        build: {
          rolldownOptions: {
            plugins: [
              {
                name: 'test:rolldown-page-output',
                augmentChunkHash() {
                  return 'page-output'
                }
              }
            ]
          }
        }
      },
      fixture.artifactDir
    )
    compilers.add(compiler)

    const error = await compiler.init().catch((error: unknown) => error)
    expect(error).toBeInstanceOf(Error)
    const message = (error as Error).message
    expect(message).toContain(
      'plugin "test:rolldown-page-output": augmentChunkHash'
    )
    expect(message.match(/test:rolldown-page-output/g)).toHaveLength(1)
  })

  test('allows bundled-only output hooks excluded from the page environment', async () => {
    const fixture = await createFixture()
    const compiler = createSsrModuleCompiler(
      {
        root: fixture.root,
        logLevel: 'silent',
        plugins: [
          {
            name: 'test:bundled-page-output',
            applyToEnvironment(environment) {
              return environment.config.isBundled
            },
            renderChunk(code) {
              return code
            }
          }
        ]
      },
      fixture.artifactDir
    )
    compilers.add(compiler)

    await expect(compiler.init()).resolves.toBeUndefined()
  })

  test('deduplicates concurrent and subsequent requests through the current manifest', async () => {
    const fixture = await createFixture()
    const virtualId = '\0test:ssr-page'
    let loadCalls = 0
    const sourcePlugin: Plugin = {
      name: 'test:ssr-page-source',
      resolveId(id) {
        if (id === 'virtual:ssr-page') return virtualId
      },
      load(id) {
        if (id === virtualId) {
          loadCalls++
          return 'export const page = "materialized"'
        }
      }
    }

    const firstCompiler = createSsrModuleCompiler(
      {
        root: fixture.root,
        logLevel: 'silent',
        plugins: [sourcePlugin]
      },
      fixture.artifactDir
    )
    compilers.add(firstCompiler)
    await firstCompiler.init()

    const [first, concurrent] = await Promise.all([
      firstCompiler.precompile('virtual:ssr-page'),
      firstCompiler.precompile('virtual:ssr-page')
    ])
    expect(concurrent).toEqual(first)
    expect(loadCalls).toBe(1)
    expect('cache' in first).toBe(false)
    if ('code' in first) {
      expect(first.code).toContain('materialized')
      expect(first.invalidate).toBe(false)
    }
    await expect(firstCompiler.precompile('virtual:ssr-page')).resolves.toEqual(
      first
    )
    expect(loadCalls).toBe(1)
  })

  test('persists released entries and scopes dependency reuse by importer', async () => {
    const fixture = await createFixture()
    const entryId = '\0test:one-shot-entry'
    const dependencyId = path.join(fixture.root, 'shared-dependency.js')
    const transformedDependencyId = '\0test:shared-dependency'

    let entryLoads = 0
    let dependencyLoads = 0
    const compiler = createSsrModuleCompiler(
      {
        root: fixture.root,
        logLevel: 'silent',
        plugins: [
          {
            name: 'test:persistence-boundary',
            resolveId(id) {
              if (id === 'virtual:one-shot-entry') return entryId
              if (id === dependencyId) return transformedDependencyId
            },
            load(id) {
              if (id === entryId) {
                entryLoads++
                return 'export const entry = true'
              }
              if (id === transformedDependencyId) {
                dependencyLoads++
                return 'export const dependency = true'
              }
            }
          }
        ]
      },
      fixture.artifactDir
    )
    compilers.add(compiler)
    await compiler.init()

    await compiler.precompile('virtual:one-shot-entry')
    await compiler.precompile('virtual:one-shot-entry')
    expect(entryLoads).toBe(1)

    const entryGraph = (
      compiler as unknown as {
        environment: {
          moduleGraph: {
            getModuleById: (id: string) => unknown
            urlToModuleMap: Map<string, { id: string | null }>
          }
        }
      }
    ).environment.moduleGraph
    expect(entryGraph.getModuleById(entryId)).toBeUndefined()
    expect(
      [...entryGraph.urlToModuleMap.values()].some(
        (module) => module.id === entryId
      )
    ).toBe(false)

    await compiler.handleFetch([dependencyId, '/first-page.md'])
    await compiler.handleFetch([dependencyId, '/first-page.md'])
    expect(dependencyLoads).toBe(1)
    await compiler.handleFetch([dependencyId, '/second-page.md'])
    expect(dependencyLoads).toBe(2)
  })

  test('removes absolute one-shot entries across ModuleRunner id spellings', async () => {
    const fixture = await createFixture()
    const entryFile = path.join(fixture.root, 'absolute-entry.js')
    await writeFile(entryFile, 'export const absoluteEntry = true')

    const compiler = createSsrModuleCompiler(
      { root: fixture.root, logLevel: 'silent' },
      fixture.artifactDir
    )
    compilers.add(compiler)
    await compiler.init()

    const result = await compiler.precompile(entryFile)
    expect('code' in result && result.code).toContain('absoluteEntry')

    const graph = (
      compiler as unknown as {
        environment: {
          moduleGraph: {
            idToModuleMap: Map<string, { id: string | null }>
            urlToModuleMap: Map<string, { id: string | null }>
          }
        }
      }
    ).environment.moduleGraph
    expect(
      [...graph.idToModuleMap.values(), ...graph.urlToModuleMap.values()].some(
        (module) => module.id?.replace(/[?#].*$/, '') === entryFile
      )
    ).toBe(false)
  })

  test('keeps importer-aware resolution and assets distinct for absolute requests', async () => {
    const fixture = await createFixture()
    const firstBridge = path.join(fixture.root, 'runtime-one.mjs')
    const secondBridge = path.join(fixture.root, 'runtime-two.mjs')
    const absoluteId = path.join(fixture.root, 'shared-runtime.js')
    const windowsAbsoluteId = 'C:/docs/shared-runtime.js'
    const fileUrlId = pathToFileURL(
      path.join(fixture.root, 'file-url-runtime.js')
    ).href
    const ids = [absoluteId, windowsAbsoluteId, fileUrlId]
    const importerOne = '/first-page.md'
    const importerTwo = '/second-page.md'
    const resolvedIds = new Map(
      ids.map((id, index) => [
        id,
        [`\0test:runtime-${index}-one`, `\0test:runtime-${index}-two`]
      ])
    )
    const replacements = new Map<string, string>()
    for (const [one, two] of resolvedIds.values()) {
      replacements.set(one, firstBridge)
      replacements.set(two, secondBridge)
    }
    const absoluteAsset = path.join(fixture.root, 'logo.svg')
    const compiler = createSsrModuleCompiler(
      {
        root: fixture.root,
        logLevel: 'silent',
        plugins: [
          {
            name: 'test:runtime-replacement-ids',
            resolveId(id, importer) {
              const resolved = resolvedIds.get(id)
              if (resolved) {
                return importer === importerOne ? resolved[0] : resolved[1]
              }
            }
          }
        ]
      },
      fixture.artifactDir,
      {
        runtimeBridges: replacements,
        resolveAsset(id, importer) {
          if (id !== absoluteAsset && id !== fileUrlId) return
          return importer === importerOne
            ? '/assets/logo-one.svg'
            : '/assets/logo-two.svg'
        }
      }
    )
    compilers.add(compiler)
    await compiler.init()

    for (const id of [absoluteId, windowsAbsoluteId]) {
      await expect(compiler.handleFetch([id, importerOne])).resolves.toEqual({
        externalize: pathToFileURL(firstBridge).href,
        type: 'module'
      })
      await expect(compiler.handleFetch([id, importerTwo])).resolves.toEqual({
        externalize: pathToFileURL(secondBridge).href,
        type: 'module'
      })
    }

    const firstAsset = await compiler.handleFetch([absoluteAsset, importerOne])
    const secondAsset = await compiler.handleFetch([absoluteAsset, importerTwo])
    expect('code' in firstAsset && firstAsset.code).toContain(
      '/assets/logo-one.svg'
    )
    expect('code' in secondAsset && secondAsset.code).toContain(
      '/assets/logo-two.svg'
    )

    const firstFileUrlAsset = await compiler.handleFetch([
      fileUrlId,
      importerOne
    ])
    const secondFileUrlAsset = await compiler.handleFetch([
      fileUrlId,
      importerTwo
    ])
    expect('code' in firstFileUrlAsset && firstFileUrlAsset.code).toContain(
      '/assets/logo-one.svg'
    )
    expect('code' in secondFileUrlAsset && secondFileUrlAsset.code).toContain(
      '/assets/logo-two.svg'
    )
  })

  test('omits inline sourcemaps and releases transforms without invalidating importers', async () => {
    const fixture = await createFixture()
    const virtualId = '\0test:mapped-module'
    const source = 'export const mapped = true'
    const compiler = createSsrModuleCompiler(
      {
        root: fixture.root,
        logLevel: 'silent',
        plugins: [
          {
            name: 'test:mapped-module',
            resolveId(id) {
              if (id === 'virtual:mapped-module') return virtualId
            },
            load(id) {
              if (id === virtualId) return source
            },
            transform(code, id) {
              if (id !== virtualId) return
              return {
                code,
                map: {
                  version: 3,
                  names: [],
                  sources: ['mapped-source.ts'],
                  sourcesContent: [source],
                  mappings: 'AAAA'
                }
              }
            }
          }
        ]
      },
      fixture.artifactDir
    )
    compilers.add(compiler)
    await compiler.init()

    const graph = (
      compiler as unknown as {
        environment: {
          moduleGraph: {
            invalidateModule: (...args: unknown[]) => void
            updateModuleTransformResult: (...args: unknown[]) => void
          }
        }
      }
    ).environment.moduleGraph
    const invalidate = vi.spyOn(graph, 'invalidateModule')
    const release = vi.spyOn(graph, 'updateModuleTransformResult')

    const result = await compiler.precompile('virtual:mapped-module')
    expect('code' in result).toBe(true)
    if ('code' in result) {
      expect(result.code).not.toContain('sourceMappingURL=data:')
      expect(result.code).not.toContain('sourceMappingSource=vite-generated')
      expect(result.invalidate).toBe(false)
    }
    expect(invalidate).not.toHaveBeenCalled()
    expect(release).toHaveBeenCalledWith(
      expect.objectContaining({ id: virtualId }),
      null
    )
  })

  test('waits for accepted fetches before closing the environment', async () => {
    const fixture = await createFixture()
    const virtualId = '\0test:slow-module'
    let finishLoad!: (source: string) => void
    let markLoadStarted!: () => void
    const loadStarted = new Promise<void>((resolve) => {
      markLoadStarted = resolve
    })
    const compiler = createSsrModuleCompiler(
      {
        root: fixture.root,
        logLevel: 'silent',
        plugins: [
          {
            name: 'test:slow-module',
            resolveId(id) {
              if (id === 'virtual:slow-module') return virtualId
            },
            load(id) {
              if (id !== virtualId) return
              markLoadStarted()
              return new Promise<string>((resolve) => {
                finishLoad = resolve
              })
            }
          }
        ]
      },
      fixture.artifactDir
    )
    compilers.add(compiler)
    await compiler.init()

    const fetch = compiler.precompile('virtual:slow-module')
    await loadStarted
    const closing = compiler.close()
    await expect(compiler.precompile('virtual:slow-module')).rejects.toThrow(
      'SSR module compiler is closing'
    )

    finishLoad('export const slow = true')
    await expect(fetch).resolves.toEqual(
      expect.objectContaining({ invalidate: false })
    )
    await closing
  })

  test('materializes page graphs for an offline ModuleRunner', async () => {
    const fixture = await createFixture()
    const entry = path.join(fixture.root, 'page.js')
    const dependency = path.join(fixture.root, 'dependency.js')
    const dynamicDependency = path.join(fixture.root, 'dynamic.js')
    await Promise.all([
      writeFile(
        entry,
        [
          "import { dependency } from './dependency.js'",
          'export const value = `page:${dependency}`',
          "export const loadDynamic = () => import('./dynamic.js')"
        ].join('\n')
      ),
      writeFile(dependency, 'export const dependency = "shared"'),
      writeFile(dynamicDependency, 'export const dynamic = "loaded"')
    ])

    const compiler = createSsrModuleCompiler(
      { root: fixture.root, logLevel: 'silent' },
      fixture.artifactDir
    )
    compilers.add(compiler)
    await compiler.init()

    const materialized = await compiler.materializeGraphs([entry], 2)
    expect(materialized.entries).toBe(1)
    expect(materialized.requests).toBe(3)
    const snapshot = path.join(fixture.artifactDir, 'snapshots', 'page.json')
    await compiler.writeSnapshotForEntries([entry], snapshot)
    const builtins = compiler.getBuiltins()
    await compiler.close()
    compilers.delete(compiler)

    const runner = new ModuleRunner({
      transport: new SsrModuleArtifactTransport(
        fixture.artifactDir,
        builtins,
        snapshot
      ),
      hmr: false,
      createImportMeta: createNodeImportMeta,
      sourcemapInterceptor: false
    })
    try {
      const page = (await runner.import(entry)) as {
        value: string
        loadDynamic: () => Promise<{ dynamic: string }>
      }
      expect(page.value).toBe('page:shared')
      await expect(page.loadDynamic()).resolves.toMatchObject({
        dynamic: 'loaded'
      })
    } finally {
      await runner.close()
    }
  })

  test('uses ModuleRunner file identity for query-module dependencies', async () => {
    const fixture = await createFixture()
    const entry = path.join(fixture.root, 'page.js')
    const script = path.join(fixture.root, 'script.js')
    const dependency = path.join(fixture.root, 'dependency.js')
    await Promise.all([
      writeFile(
        entry,
        "import { value } from './script.js?part'\nexport { value }"
      ),
      writeFile(
        script,
        "import { dependency } from './dependency.js'\nexport const value = `query:${dependency}`"
      ),
      writeFile(dependency, 'export const dependency = "shared"')
    ])

    const compiler = createSsrModuleCompiler(
      { root: fixture.root, logLevel: 'silent' },
      fixture.artifactDir
    )
    compilers.add(compiler)
    await compiler.init()
    await compiler.materializeGraphs([entry])
    const snapshot = path.join(fixture.artifactDir, 'snapshots', 'query.json')
    await compiler.writeSnapshotForEntries([entry], snapshot)

    const builtins = compiler.getBuiltins()
    await compiler.close()
    compilers.delete(compiler)

    const runner = new ModuleRunner({
      transport: new SsrModuleArtifactTransport(
        fixture.artifactDir,
        builtins,
        snapshot
      ),
      hmr: false,
      createImportMeta: createNodeImportMeta,
      sourcemapInterceptor: false
    })
    try {
      await expect(runner.import(entry)).resolves.toMatchObject({
        value: 'query:shared'
      })
    } finally {
      await runner.close()
    }
  })

  test('publishes only the module closure reachable by one worker batch', async () => {
    const fixture = await createFixture()
    const pageA = path.join(fixture.root, 'page-a.js')
    const pageB = path.join(fixture.root, 'page-b.js')
    const shared = path.join(fixture.root, 'shared.js')
    const dynamicA = path.join(fixture.root, 'dynamic-a.js')
    const onlyB = path.join(fixture.root, 'only-b.js')
    await Promise.all([
      writeFile(
        pageA,
        [
          "import { shared } from './shared.js'",
          'export const value = `a:${shared}`',
          "export const loadDynamic = () => import('./dynamic-a.js')"
        ].join('\n')
      ),
      writeFile(
        pageB,
        [
          "import { shared } from './shared.js'",
          "import { onlyB } from './only-b.js'",
          'export const value = `b:${shared}:${onlyB}`'
        ].join('\n')
      ),
      writeFile(shared, 'export const shared = "shared"'),
      writeFile(dynamicA, 'export const dynamicA = "dynamic-a"'),
      writeFile(onlyB, 'export const onlyB = "only-b"')
    ])

    const compiler = createSsrModuleCompiler(
      { root: fixture.root, logLevel: 'silent' },
      fixture.artifactDir
    )
    compilers.add(compiler)
    await compiler.init()
    const materialized = await compiler.materializeGraphs([pageA, pageB], 2)

    const batchSnapshot = path.join(
      fixture.artifactDir,
      'snapshots',
      'page-a.json'
    )
    const requestCount = await compiler.writeSnapshotForEntries(
      [pageA],
      batchSnapshot
    )
    const slicedSnapshot = JSON.parse(
      await readFile(batchSnapshot, 'utf8')
    ) as { requests: [string, string][] }
    expect(slicedSnapshot.requests).toHaveLength(requestCount)
    expect(requestCount).toBeLessThan(materialized.requests)
    await expect(
      readFile(path.join(fixture.artifactDir, 'snapshot.json'), 'utf8')
    ).rejects.toMatchObject({ code: 'ENOENT' })

    const builtins = compiler.getBuiltins()
    await compiler.close()
    compilers.delete(compiler)

    const runner = new ModuleRunner({
      transport: new SsrModuleArtifactTransport(
        fixture.artifactDir,
        builtins,
        batchSnapshot
      ),
      hmr: false,
      createImportMeta: createNodeImportMeta,
      sourcemapInterceptor: false
    })
    try {
      const page = (await runner.import(pageA)) as {
        value: string
        loadDynamic: () => Promise<{ dynamicA: string }>
      }
      expect(page.value).toBe('a:shared')
      await expect(page.loadDynamic()).resolves.toMatchObject({
        dynamicA: 'dynamic-a'
      })

      // The shared CAS contains page B. The batch snapshot must still limit the
      // worker to its declared modules.
      await expect(runner.import(pageB)).rejects.toThrow(
        /Missing precompiled SSR module/
      )
    } finally {
      await runner.close()
    }
  })

  test('rejects runtime-computed imports before offline rendering', async () => {
    const fixture = await createFixture()
    const entry = path.join(fixture.root, 'computed.js')
    await writeFile(
      entry,
      [
        "const target = './dependency.js'",
        'export const load = () => import(target)'
      ].join('\n')
    )

    const compiler = createSsrModuleCompiler(
      { root: fixture.root, logLevel: 'silent' },
      fixture.artifactDir
    )
    compilers.add(compiler)
    await compiler.init()

    await expect(compiler.materializeGraphs([entry])).rejects.toThrow(
      /runtime-computed import/
    )
  })

  test('reports a missing offline module with its importer', async () => {
    const fixture = await createFixture()
    const transport = new SsrModuleArtifactTransport(
      fixture.artifactDir,
      [],
      path.join(fixture.artifactDir, 'snapshots', 'missing.json')
    )

    await expect(
      transport.invoke({
        type: 'custom',
        event: 'vite:invoke',
        data: {
          name: 'fetchModule',
          data: ['./missing.js', '/page.js', {}]
        }
      })
    ).rejects.toThrow(/\.\/missing\.js.*\/page\.js/)
  })
})
