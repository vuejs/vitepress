import { describe, expect, test, vi } from 'vitest'
import type { Plugin, PluginOption, Rollup } from 'vite'
import { createVitePressPlugin } from '../../../src/node/plugin'
import type { SiteConfig } from '../../../src/node/siteConfig'

describe('vitepress plugin', () => {
  test('strips only markdown-owned vapor static template payloads in lean chunks', async () => {
    const pageToHashMap: Record<string, string> = {}
    const plugins = await createVitePressPlugin(
      createSiteConfig(),
      false,
      pageToHashMap
    )
    const plugin = findPluginByName(plugins, 'vitepress')
    const staticMarkersPlugin = findPluginByName(
      plugins,
      'vitepress:static-markers'
    )
    expect(staticMarkersPlugin.apply).toBe('build')
    const code = [
      `const t0 = _template("<span>", false, true)`,
      `const t1 = _template("<img src=\\"" + _imports_0 + "\\"srcset>", false, true)`,
      `const t2 = _template("<img srcset=\\"" + _imports_0 + ' 1x, ' + _imports_1 + ' 2x' + "\\">", false, true)`,
      `const t3 = _template("<div>", true)`,
      `const t4 = _template("", false)`
    ].join('\n')
    const generateBundle = plugin.generateBundle

    if (!generateBundle || typeof generateBundle === 'function') {
      throw new Error('vitepress plugin is missing expected build hooks')
    }

    if (!staticMarkersPlugin.transform) {
      throw new Error(
        'vitepress static marker plugin is missing transform hook'
      )
    }

    const transformHandler =
      typeof staticMarkersPlugin.transform === 'function'
        ? staticMarkersPlugin.transform
        : staticMarkersPlugin.transform.handler
    const transformed = transformHandler.call(
      {} as never,
      code,
      `${process.cwd()}/guide.md?vue&type=template`
    )

    expect(transformed).toContain(
      `const t0 = _template("__VP_STATIC_START__<span>__VP_STATIC_END__", false, true)`
    )
    expect(transformed).toContain(
      `const t1 = _template("__VP_STATIC_START__<img src=\\"" + _imports_0 + "\\"srcset>__VP_STATIC_END__", false, true)`
    )
    expect(transformed).toContain(
      `const t2 = _template("__VP_STATIC_START__<img srcset=\\"" + _imports_0 + ' 1x, ' + _imports_1 + ' 2x' + "\\">__VP_STATIC_END__", false, true)`
    )
    expect(transformed).toContain(`const t3 = _template("<div>", true)`)
    expect(transformed).toContain(`const t4 = _template("", false)`)

    const chunk = createPageChunk(
      'guide',
      'guide.abc123.js',
      [
        transformed as string,
        `const imported = _template("<p>imported component</p>", false, true)`
      ].join('\n')
    )

    const bundle = {
      [chunk.fileName]: chunk
    }
    const emitFile = vi.fn()

    generateBundle.handler.call(
      { emitFile } as never,
      {} as never,
      bundle,
      false
    )

    expect(pageToHashMap.guide).toBe('abc123')
    expect(emitFile).toHaveBeenCalledTimes(1)
    expect(emitFile.mock.calls[0][0]).toMatchObject({
      fileName: 'guide.abc123.lean.js'
    })
    expect(emitFile.mock.calls[0][0].source).toContain(
      `const t0 = _template("", false, true)`
    )
    expect(emitFile.mock.calls[0][0].source).toContain(
      `const t1 = _template("", false, true)`
    )
    expect(emitFile.mock.calls[0][0].source).toContain(
      `const t2 = _template("", false, true)`
    )
    expect(emitFile.mock.calls[0][0].source).toContain(
      `const t3 = _template("<div>", true)`
    )
    expect(emitFile.mock.calls[0][0].source).toContain(
      `const t4 = _template("", false)`
    )
    expect(emitFile.mock.calls[0][0].source).toContain(
      `const imported = _template("<p>imported component</p>", false, true)`
    )
    expect(bundle[chunk.fileName].code).toContain(
      `const t0 = _template("<span>", false, true)`
    )
    expect(bundle[chunk.fileName].code).toContain(
      `const t1 = _template("<img src=\\"" + _imports_0 + "\\"srcset>", false, true)`
    )
    expect(bundle[chunk.fileName].code).toContain(
      `const t2 = _template("<img srcset=\\"" + _imports_0 + ' 1x, ' + _imports_1 + ' 2x' + "\\">", false, true)`
    )
    expect(bundle[chunk.fileName].code).not.toContain(`__VP_STATIC_`)
  })

  test('strips only markdown-owned vdom static vnode payloads in lean chunks', async () => {
    const pageToHashMap: Record<string, string> = {}
    const siteConfig = createSiteConfig()
    siteConfig.vue = {}
    const plugins = await createVitePressPlugin(
      siteConfig,
      false,
      pageToHashMap
    )
    const plugin = findPluginByName(plugins, 'vitepress')
    const staticMarkersPlugin = findPluginByName(
      plugins,
      'vitepress:static-markers'
    )
    const generateBundle = plugin.generateBundle

    if (!generateBundle || typeof generateBundle === 'function') {
      throw new Error('vitepress plugin is missing expected build hooks')
    }

    if (!staticMarkersPlugin.transform) {
      throw new Error(
        'vitepress static marker plugin is missing transform hook'
      )
    }

    const transformHandler =
      typeof staticMarkersPlugin.transform === 'function'
        ? staticMarkersPlugin.transform
        : staticMarkersPlugin.transform.handler
    const transformed = transformHandler.call(
      {} as never,
      `const t0 = createStaticVNode("<p>markdown</p>", 1)`,
      `${process.cwd()}/guide.md?vue&type=template`
    )

    expect(transformed).toContain(
      `const t0 = createStaticVNode("__VP_STATIC_START__<p>markdown</p>__VP_STATIC_END__", 1)`
    )

    const chunk = createPageChunk(
      'guide',
      'guide.abc123.js',
      [
        transformed as string,
        `const imported = createStaticVNode("<p>imported component</p>", 1)`
      ].join('\n')
    )
    const bundle = {
      [chunk.fileName]: chunk
    }
    const emitFile = vi.fn()

    generateBundle.handler.call(
      { emitFile } as never,
      {} as never,
      bundle,
      false
    )

    expect(emitFile.mock.calls[0][0].source).toContain(
      `const t0 = createStaticVNode("", 1)`
    )
    expect(emitFile.mock.calls[0][0].source).toContain(
      `const imported = createStaticVNode("<p>imported component</p>", 1)`
    )
    expect(bundle[chunk.fileName].code).toContain(
      `const t0 = createStaticVNode("<p>markdown</p>", 1)`
    )
    expect(bundle[chunk.fileName].code).not.toContain(`__VP_STATIC_`)
  })
})

function createPageChunk(
  name: string,
  fileName: string,
  code: string
): Rollup.OutputChunk & { facadeModuleId: string } {
  return {
    type: 'chunk',
    code,
    dynamicImports: [],
    exports: [],
    facadeModuleId: `${process.cwd()}/${name}.md`,
    fileName,
    implicitlyLoadedBefore: [],
    importedBindings: {},
    imports: [],
    isDynamicEntry: false,
    isEntry: true,
    isImplicitEntry: false,
    map: null,
    moduleIds: [],
    modules: {},
    name,
    preliminaryFileName: fileName,
    referencedFiles: [],
    sourcemapFileName: null
  } as unknown as Rollup.OutputChunk & { facadeModuleId: string }
}

function createSiteConfig(): SiteConfig {
  return {
    __dirty: true,
    pages: [],
    dynamicRoutes: [],
    rewrites: { map: {}, inv: {} },
    site: {
      base: '/',
      lang: 'en-US',
      dir: 'ltr',
      title: '',
      description: '',
      head: [],
      appearance: true,
      themeConfig: {},
      scrollOffset: 0,
      locales: {},
      router: { prefetchLinks: true }
    },
    vue: { features: { vapor: true } },
    ignoreDeadLinks: true
  } as unknown as SiteConfig
}

function findPluginByName(
  plugins: readonly PluginOption[],
  name: string
): Plugin {
  for (const plugin of plugins) {
    if (Array.isArray(plugin)) {
      const nested = findPluginByName(plugin, name)
      if (nested) return nested
      continue
    }

    if (
      plugin &&
      typeof plugin === 'object' &&
      !('then' in plugin) &&
      'name' in plugin &&
      plugin.name === name
    ) {
      return plugin
    }
  }

  throw new Error(`failed to find plugin: ${name}`)
}
