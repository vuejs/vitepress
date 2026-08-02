import { resolvePageArtifactCachePolicy } from 'node/build/build'
import type { SiteConfig } from 'node/config'

function createSiteConfig(
  markdown: SiteConfig['markdown'],
  overrides: Partial<SiteConfig> = {}
): SiteConfig {
  return {
    cacheDir: '/persistent-cache',
    publicDir: '/site/public',
    cleanUrls: false,
    lastUpdated: false,
    ignoreDeadLinks: false,
    markdown,
    site: {
      base: '/',
      locales: {},
      themeConfig: {}
    },
    ...overrides
  } as SiteConfig
}

describe('page artifact cache policy', () => {
  test('persists declarative artifact configuration', () => {
    const config = createSiteConfig({
      lineNumbers: true,
      image: { lazyLoad: true },
      languageAlias: { shell: 'bash' }
    })

    expect(resolvePageArtifactCachePolicy(config, '/build-a')).toEqual({
      persistent: true,
      root: '/persistent-cache'
    })
  })

  test('uses an isolated per-build store when cache is disabled', () => {
    const config = createSiteConfig({
      cache: false,
      cacheKey: 'ignored-while-disabled'
    })

    const first = resolvePageArtifactCachePolicy(config, '/build-a')
    const second = resolvePageArtifactCachePolicy(config, '/build-b')

    expect(first).toEqual({
      persistent: false,
      root: '/build-a/page-artifact-cache'
    })
    expect(second).toEqual({
      persistent: false,
      root: '/build-b/page-artifact-cache'
    })
    expect(first.root).not.toBe(second.root)
  })

  test('does not persist opaque hook closures without an explicit key', () => {
    const markdownHook = createSiteConfig({ config() {} })
    const viteHook = createSiteConfig(undefined, {
      vite: { plugins: [{ name: 'opaque', transform() {} }] }
    })

    expect(
      resolvePageArtifactCachePolicy(markdownHook, '/build').persistent
    ).toBe(false)
    expect(resolvePageArtifactCachePolicy(viteHook, '/build').persistent).toBe(
      false
    )
  })

  test('an explicit whole-page key opts opaque hooks into persistence', () => {
    const config = createSiteConfig(
      { cacheKey: 'external-state-v2', config() {} },
      {
        transformPageData() {},
        vite: { plugins: [{ name: 'opaque', transform() {} }] }
      }
    )

    expect(resolvePageArtifactCachePolicy(config, '/build')).toEqual({
      persistent: true,
      root: '/persistent-cache'
    })
  })

  test('rejects an empty explicit key', () => {
    const config = createSiteConfig({ cacheKey: '  ' })

    expect(() => resolvePageArtifactCachePolicy(config, '/build')).toThrow(
      'markdown.cacheKey must be a non-empty string.'
    )
  })
})
