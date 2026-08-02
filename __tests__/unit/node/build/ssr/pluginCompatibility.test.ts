import {
  adaptSsrBatchPagePlugins,
  validateSsrBatchPageOutputHooks
} from 'node/build/ssr/pluginCompatibility'
import type { Plugin, Rolldown } from 'vite'

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

test('rejects user bundle-graph and output hooks with their names', async () => {
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

test('rejects nested output plugins and output addons', async () => {
  const output = {
    banner: '/* server page */',
    plugins: [
      false,
      [Promise.resolve({ name: 'server-page-assets', writeBundle() {} })]
    ]
  } as Rolldown.OutputOptions
  await expect(validateSsrBatchPageOutputHooks([], output)).rejects.toThrow(
    [
      '  - output options "output": banner',
      '  - output plugin "server-page-assets": writeBundle'
    ].join('\n')
  )
})
