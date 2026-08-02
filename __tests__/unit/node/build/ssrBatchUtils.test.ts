import {
  adaptSsrBatchPagePlugins,
  createSsrBatchPlan,
  createWorkerExecArgv,
  validateBuildConcurrency,
  validateSsrBatchPageOutputHooks,
  validateSsrBuildBatchSize,
  validateSsrBuildWorkerConcurrency
} from 'node/build/ssrBatchUtils'
import type { Plugin, Rolldown } from 'vite'

describe('SSR batch planning', () => {
  test('adapts frozen user plugins without changing internal plugins', () => {
    const userPlugin = Object.freeze({
      name: 'frozen-user-plugin',
      transform(this: any) {
        return `${this.environment.mode}:${this.meta.watchMode}:${typeof this.setAssetSource}`
      }
    }) as Plugin
    const internalPlugin = Object.freeze({
      name: 'vite:internal-test',
      transform() {}
    }) as Plugin

    const [adaptedUser, adaptedInternal] = adaptSsrBatchPagePlugins([
      userPlugin,
      internalPlugin
    ])
    expect(adaptedUser).not.toBe(userPlugin)
    expect(adaptedInternal).toBe(internalPlugin)

    const transform = adaptedUser.transform
    const handler =
      typeof transform === 'function' ? transform : transform?.handler
    expect(
      handler?.call(
        {
          environment: { mode: 'dev' },
          meta: { watchMode: true }
        },
        '',
        '/page.js',
        { moduleType: 'js', ssr: true }
      )
    ).toBe('build:false:undefined')
  })

  test('requires positive global build concurrency', () => {
    expect(validateBuildConcurrency(1)).toBe(1)
    expect(validateBuildConcurrency(64)).toBe(64)

    for (const value of [undefined, 0, -1, 1.5, Number.NaN, Infinity, '2']) {
      expect(() => validateBuildConcurrency(value)).toThrow(
        'buildConcurrency must be a positive integer.'
      )
    }
  })

  test('requires a positive integer when configured', () => {
    expect(validateSsrBuildBatchSize(undefined)).toBeUndefined()
    expect(validateSsrBuildBatchSize(64)).toBe(64)

    for (const value of [0, -1, 1.5, Number.NaN, Infinity, '2', null]) {
      expect(() => validateSsrBuildBatchSize(value)).toThrow(
        'ssrBuildBatchSize must be a positive integer.'
      )
    }
  })

  test('requires positive render-worker concurrency', () => {
    expect(validateSsrBuildWorkerConcurrency(1)).toBe(1)
    expect(validateSsrBuildWorkerConcurrency(4)).toBe(4)

    for (const value of [undefined, 0, -1, 1.5, Number.NaN, '2', null]) {
      expect(() => validateSsrBuildWorkerConcurrency(value)).toThrow(
        'ssrBuildWorkerConcurrency must be a positive integer.'
      )
    }
  })

  test('partitions the render queue without reordering pages', () => {
    const pages = ['a.md', 'b.md', 'c.md', 'd.md', 'e.md']
    const batches = createSsrBatchPlan(pages, 2)

    expect(batches.flatMap((batch) => batch.pages)).toEqual([
      '404.md',
      ...pages
    ])
    expect(batches.map((batch) => batch.offset)).toEqual([0, 2, 4])
    expect(batches.every((batch) => batch.pages.length <= 2)).toBe(true)
  })

  test('supports a synthetic 404-only batch', () => {
    expect(createSsrBatchPlan([], 10)).toEqual([
      { offset: 0, pages: ['404.md'] }
    ])
  })

  test('does not schedule a custom 404 page twice', () => {
    const batches = createSsrBatchPlan(['guide.md', '404.md'], 2)
    expect(batches.flatMap((batch) => batch.pages)).toEqual([
      '404.md',
      'guide.md'
    ])
  })

  test('accepts transform and teardown hooks plus Vite internal bundle hooks', async () => {
    const plugins = [
      {
        name: 'fabric-docs:transform-files',
        transform(code: string) {
          return code
        },
        buildEnd() {},
        closeBundle() {}
      },
      {
        name: 'vite:css-post',
        renderChunk() {},
        augmentChunkHash() {}
      },
      {
        name: 'vitepress',
        renderStart() {},
        generateBundle() {}
      }
    ] as Plugin[]

    await expect(
      validateSsrBatchPageOutputHooks(plugins, undefined)
    ).resolves.toBeUndefined()
  })

  test('rejects user bundle-graph and output hooks with plugin and hook names', async () => {
    const plugins = [
      {
        name: 'custom-page-renderer',
        moduleParsed() {},
        renderChunk: { handler() {} },
        augmentChunkHash() {
          return 'custom'
        }
      },
      {
        name: 'page-manifest',
        resolveDynamicImport() {
          return null
        },
        generateBundle() {}
      }
    ] as Plugin[]

    await expect(
      validateSsrBatchPageOutputHooks(plugins, undefined)
    ).rejects.toThrow(
      [
        'SSR batching cannot preserve Rolldown bundle hooks for unbundled SSR page modules:',
        '  - plugin "custom-page-renderer": moduleParsed, augmentChunkHash, renderChunk',
        '  - plugin "page-manifest": resolveDynamicImport, generateBundle',
        'Disable ssrBuildBatchSize'
      ].join('\n')
    )
  })

  test('rejects async nested Rolldown output plugins and output addons', async () => {
    const outputPlugin = Promise.resolve({
      name: 'server-page-assets',
      writeBundle() {}
    })
    const output = {
      banner: '/* server page */',
      plugins: [false, [outputPlugin]]
    } as Rolldown.OutputOptions

    await expect(validateSsrBatchPageOutputHooks([], output)).rejects.toThrow(
      [
        '  - output options "output": banner',
        '  - output plugin "server-page-assets": writeBundle'
      ].join('\n')
    )
  })
})

const inspectorOverrides = [
  '--no-inspect',
  '--no-inspect-brk',
  '--no-inspect-wait'
].filter((flag) => process.allowedNodeEnvironmentFlags.has(flag))

test('worker exec arguments omit inspector flags and override NODE_OPTIONS', () => {
  expect(
    createWorkerExecArgv([
      '--enable-source-maps',
      '--inspect',
      '--inspect-brk=127.0.0.1:9230',
      '--inspect-port',
      '9231',
      '--loader',
      'tsx',
      '--inspect-publish-uid',
      'stderr,http',
      '--conditions=development'
    ])
  ).toEqual([
    '--enable-source-maps',
    '--loader',
    'tsx',
    '--conditions=development',
    ...inspectorOverrides
  ])
})

test('worker exec arguments omit parent entrypoint modes', () => {
  expect(
    createWorkerExecArgv([
      '--enable-source-maps',
      '--',
      '-e',
      'build()',
      '--input-type',
      'module',
      '--test',
      '--watch-path',
      'src',
      '--test-coverage-include',
      'src/**/*.ts',
      '--watch-kill-signal=SIGTERM',
      '-pe',
      'process.version',
      '--conditions=development'
    ])
  ).toEqual([
    '--enable-source-maps',
    '--conditions=development',
    ...inspectorOverrides
  ])
})
