import { captureClientAssetUrls } from 'node/build/ssr/clientAssets'
import type { SiteConfig } from 'node/config'
import type { ResolvedConfig, Rolldown } from 'vite'

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
