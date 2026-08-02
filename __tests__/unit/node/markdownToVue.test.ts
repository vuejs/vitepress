import { resolveConfig } from 'node/config'
import {
  canCompileSsrPageArtifact,
  createMarkdownToVueRenderFn,
  createStaticPageVueSource,
  prepareStaticHtmlForSsr
} from 'node/markdownToVue'
import { PageArtifactStore } from 'node/pageArtifacts'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

describe('node/markdownToVue', () => {
  let root: string | undefined

  afterEach(async () => {
    if (root) {
      await rm(root, { recursive: true, force: true })
      root = undefined
    }
  })

  test('records source line numbers for dead links', async () => {
    root = await mkdtemp(path.join(tmpdir(), 'vitepress-dead-link-'))

    const file = path.join(root, 'index.md')
    const src = '# Home\n\nIntro\n\n[Missing](./missing.md)\n'
    await writeFile(file, src)

    const siteConfig = await resolveConfig(root, 'build', 'production')
    const render = await createMarkdownToVueRenderFn(
      siteConfig.srcDir,
      { cache: false },
      '/',
      false,
      false,
      siteConfig
    )

    const result = await render(src, file)

    expect(result.deadLinks).toContainEqual({
      url: './missing',
      file,
      line: 5
    })
  })

  test('records source line numbers after frontmatter', async () => {
    root = await mkdtemp(path.join(tmpdir(), 'vitepress-dead-link-'))

    const file = path.join(root, 'index.md')
    const src =
      '---\ntitle: Home\n---\n# Home\n\nIntro\n\n[Missing](./missing.md)\n'
    await writeFile(file, src)

    const siteConfig = await resolveConfig(root, 'build', 'production')
    const render = await createMarkdownToVueRenderFn(
      siteConfig.srcDir,
      { cache: false },
      '/',
      false,
      false,
      siteConfig
    )

    const result = await render(src, file)

    expect(result.deadLinks).toContainEqual({
      url: './missing',
      file,
      line: 8
    })
  })

  test('selects included heading sections after frontmatter', async () => {
    root = await mkdtemp(path.join(tmpdir(), 'vitepress-include-'))

    const file = path.join(root, 'index.md')
    const source = path.join(root, 'source.md')
    await writeFile(
      source,
      [
        '---',
        'description: Source description',
        '---',
        '# Intro',
        '',
        'intro text',
        '',
        '## Shared',
        '',
        'shared before target',
        '',
        '## Target',
        '',
        'target text',
        '',
        '### Child',
        '',
        'child text',
        '',
        '## Shared',
        '',
        'shared after target',
        ''
      ].join('\n')
    )
    const src = '<!--@include: ./source.md#target-->'
    await writeFile(file, src)

    const siteConfig = await resolveConfig(root, 'build', 'production')
    const render = await createMarkdownToVueRenderFn(
      siteConfig.srcDir,
      { cache: false },
      '/',
      false,
      false,
      siteConfig
    )

    const result = await render(src, file)

    expect(result.vueSrc).toContain('<p>target text</p>')
    expect(result.vueSrc).toContain('<h3 id="child"')
    expect(result.vueSrc).toContain('<p>child text</p>')
    expect(result.vueSrc).not.toContain('Source description')
    expect(result.vueSrc).not.toContain('intro text')
    expect(result.vueSrc).not.toContain('shared before target')
    expect(result.vueSrc).not.toContain('shared after target')
  })

  test('applies rewrites with mismatched Windows drive letter case', async () => {
    root = await mkdtemp(path.join(tmpdir(), 'vitepress-rewrite-'))

    const file = path.join(root, 'index.md')
    await writeFile(file, '# Home\n')

    const siteConfig = await resolveConfig(root, 'build', 'production')
    siteConfig.srcDir = 'c:/site/docs'
    siteConfig.pages = ['en/index.md']
    siteConfig.rewrites = {
      map: { 'en/index.md': 'index.md' },
      inv: { 'index.md': 'en/index.md' }
    }
    ;(siteConfig as any).__dirty = true

    const render = await createMarkdownToVueRenderFn(
      siteConfig.srcDir,
      { cache: false },
      '/',
      false,
      false,
      siteConfig
    )

    const result = await render('# Home\n', 'C:/site/docs/en/index.md')

    expect(result.pageData.relativePath).toBe('index.md')
  })

  test('refreshes cached Vue page data after hooks without mutating the base artifact', async () => {
    root = await mkdtemp(path.join(tmpdir(), 'vitepress-page-data-'))

    const file = path.join(root, 'index.md')
    const src = '---\nnested:\n  value: 1\n---\n# Original\n'
    await writeFile(file, src)

    const siteConfig = await resolveConfig(root, 'build', 'production')
    siteConfig.transformPageData = vi.fn(async (pageData) => {
      ;(pageData.frontmatter.nested as { value: number }).value = 2
      return {
        title: 'Current build title',
        relativePath: 'current-build.md'
      }
    })
    const render = await createMarkdownToVueRenderFn(
      siteConfig.srcDir,
      { cache: false },
      '/',
      false,
      false,
      siteConfig,
      false,
      true,
      true
    )

    const base = await render(src, file)
    expect(siteConfig.transformPageData).not.toHaveBeenCalled()

    const finalized = await render.finalize(base, file)
    expect(siteConfig.transformPageData).toHaveBeenCalledTimes(1)
    expect(base.pageData.title).toBe('Original')
    expect(base.pageData.relativePath).toBe('index.md')
    expect(base.pageData.frontmatter.nested).toEqual({ value: 1 })
    expect(finalized.pageData.title).toBe('Current build title')
    expect(finalized.pageData.relativePath).toBe('current-build.md')
    expect(finalized.pageData.frontmatter.nested).toEqual({ value: 2 })
    expect(readEmbeddedPageData(finalized.vueSrc)).toEqual(finalized.pageData)
    expect(finalized.vueSrc).toContain(
      'export default {name:"current-build.md"}'
    )
  })

  test('runs site and dynamic-route page-data hooks once on cold and warm artifacts', async () => {
    root = await mkdtemp(path.join(tmpdir(), 'vitepress-dynamic-page-data-'))

    const stateKey = `__vitepress_page_data_${Date.now()}_${Math.random()}`
    const state = {
      build: 'cold',
      siteCalls: 0,
      dynamicCalls: 0,
      publishedWasDate: [] as boolean[]
    }
    ;(globalThis as Record<string, unknown>)[stateKey] = state

    try {
      await writeFile(
        path.join(root, '[id].md'),
        '---\npublished: 2025-01-02\n---\n# Original\n'
      )
      await writeFile(
        path.join(root, '[id].paths.mts'),
        `const state = globalThis[${JSON.stringify(stateKey)}]
export default {
  paths: [{ params: { id: 'one' } }],
  transformPageData(pageData) {
    state.dynamicCalls++
    return { title: pageData.title + ':' + state.build + ':dynamic' }
  }
}
`
      )

      const siteConfig = await resolveConfig(root, 'build', 'production')
      siteConfig.transformPageData = async (pageData) => {
        state.siteCalls++
        state.publishedWasDate.push(
          pageData.frontmatter.published instanceof Date
        )
        return {
          title: `${pageData.title}:${state.build}:site`,
          relativePath: `${state.build}.md`
        }
      }
      const route = siteConfig.dynamicRoutes[0]
      const source =
        '__VP_PARAMS_START{"id":"one"}__VP_PARAMS_END__---\npublished: 2025-01-02\n---\n# Original\n'
      const render = await createMarkdownToVueRenderFn(
        siteConfig.srcDir,
        { cache: false },
        '/',
        false,
        false,
        siteConfig,
        false,
        true,
        true
      )

      const coldCompile = vi.fn(() => render(source, route.fullPath))
      const cold = new PageArtifactStore(siteConfig.cacheDir, {
        namespace: 'dynamic-page-data'
      })
      const coldArtifact = await cold.getOrCreate(
        route.path,
        source,
        coldCompile,
        (artifact) => render.finalize(artifact, route.fullPath)
      )
      await cold.getOrCreate(route.path, source, coldCompile, (artifact) =>
        render.finalize(artifact, route.fullPath)
      )
      await cold.flush()

      expect(coldCompile).toHaveBeenCalledTimes(1)
      expect(state.siteCalls).toBe(1)
      expect(state.dynamicCalls).toBe(1)
      expect(coldArtifact.pageData.title).toBe(
        'Original:cold:site:cold:dynamic'
      )
      expect(coldArtifact.pageData.relativePath).toBe('cold.md')
      expect(readEmbeddedPageData(coldArtifact.vueSrc)).toMatchObject({
        title: coldArtifact.pageData.title,
        relativePath: coldArtifact.pageData.relativePath,
        frontmatter: { published: '2025-01-02T00:00:00.000Z' }
      })
      expect(coldArtifact.vueSrc).toContain('export default {name:"cold.md"}')

      state.build = 'warm'
      const warmCompile = vi.fn(() => render(source, route.fullPath))
      const warm = new PageArtifactStore(siteConfig.cacheDir, {
        namespace: 'dynamic-page-data'
      })
      const warmArtifact = await warm.getOrCreate(
        route.path,
        source,
        warmCompile,
        (artifact) => render.finalize(artifact, route.fullPath)
      )
      await warm.getOrCreate(route.path, source, warmCompile, (artifact) =>
        render.finalize(artifact, route.fullPath)
      )

      expect(warmCompile).not.toHaveBeenCalled()
      expect(state.siteCalls).toBe(2)
      expect(state.dynamicCalls).toBe(2)
      expect(state.publishedWasDate).toEqual([true, true])
      expect(warmArtifact.pageData.title).toBe(
        'Original:warm:site:warm:dynamic'
      )
      expect(warmArtifact.pageData.relativePath).toBe('warm.md')
      expect(readEmbeddedPageData(warmArtifact.vueSrc)).toMatchObject({
        title: warmArtifact.pageData.title,
        relativePath: warmArtifact.pageData.relativePath,
        frontmatter: { published: '2025-01-02T00:00:00.000Z' }
      })
      expect(warmArtifact.vueSrc).toContain('export default {name:"warm.md"}')
      expect((await warm.getCurrent(route.path))?.pageData).toEqual(
        warmArtifact.pageData
      )
    } finally {
      delete (globalThis as Record<string, unknown>)[stateKey]
    }
  })

  test('marks only conservatively static Markdown for the direct SSR path', async () => {
    root = await mkdtemp(path.join(tmpdir(), 'vitepress-static-page-'))

    const cases = [
      {
        name: 'plain',
        source: '# Static page\n\nPlain **Markdown** and [a link](/home).',
        expected: true
      },
      {
        name: 'component',
        source: '# Component\n\n<ClientOnly>client content</ClientOnly>',
        expected: false
      },
      {
        name: 'interpolation',
        source: '# Interpolation\n\n<span>{{ count }}</span>',
        expected: false
      },
      {
        name: 'directive',
        source: '# Directive\n\n<button @click="run">Run</button>',
        expected: false
      },
      {
        name: 'relative-asset',
        source: '# Asset\n\n![local asset](./asset.png)',
        expected: false
      },
      {
        name: 'absolute-asset',
        source: '# Asset\n\n![root asset](/asset.png)',
        expected: true
      },
      {
        name: 'v-pre-relative-asset',
        source:
          '# Asset\n\n<pre v-pre><img src="./asset.png" alt="local"></pre>',
        expected: false
      },
      {
        name: 'hash-asset',
        source: '# Asset\n\n<img src="#asset" alt="hash import">',
        expected: false
      },
      {
        name: 'mailto-asset',
        source: '# Asset\n\n<img src="mailto:image@example.com" alt="scheme">',
        expected: false
      },
      {
        name: 'duplicate-asset',
        source:
          '# Asset\n\n<img src="./asset.png" src="https://example.com/safe.png">',
        expected: false
      },
      {
        name: 'external-asset',
        source: '# Asset\n\n![external asset](https://example.com/asset.png)',
        expected: true
      },
      {
        name: 'ordinary-link',
        source: '# Link\n\n[relative page](./other-page.md)',
        expected: true
      },
      {
        name: 'svg-asset',
        source:
          '# SVG\n\n<svg><use xlink:href="./icons.svg#check"></use></svg>',
        expected: false
      },
      {
        name: 'object-asset',
        source: '# Object\n\n<object data="./document.pdf"></object>',
        expected: false
      },
      {
        name: 'link-asset',
        source: '# Link asset\n\n<link href="./theme.css">',
        expected: false
      },
      {
        name: 'srcset-asset',
        source:
          '# Sources\n\n<img srcset="https://example.com/a.png 1x, ./b.png 2x">',
        expected: false
      },
      {
        name: 'meta-asset',
        source:
          '# Metadata\n\n<meta property="og:image" content="./social.png">',
        expected: false
      },
      {
        name: 'non-asset-meta',
        source:
          '# Metadata\n\n<meta name="description" content="./plain-text">',
        expected: true
      },
      {
        name: 'boolean-ref',
        source: '# Reserved property\n\n<div ref>content</div>',
        expected: false
      },
      {
        name: 'textarea-value',
        source: '# Textarea\n\n<textarea value="content"></textarea>',
        expected: false
      },
      {
        name: 'highlighted-code',
        source: '# Code\n\n```js\nconsole.log("render")\n```',
        expected: true
      },
      {
        name: 'default-theme-badge',
        source: '# Badge <Badge type="warning">1.2.3</Badge>',
        expected: true
      },
      {
        name: 'html-comment',
        source: '# Comment\n\n<!-- preserved -->\n\nContent',
        expected: true
      },
      {
        name: 'sfc-block',
        source:
          '# SFC\n\n<script setup>const value = 1</script>\n\n<style>h1 { color: red }</style>',
        expected: false
      },
      {
        name: 'scoped-style',
        source: '# Scoped style\n\n<style scoped>h1 { color: red }</style>',
        expected: false
      },
      {
        name: 'css-module',
        source: '# CSS module\n\n<style module>.title { color: red }</style>',
        expected: false
      }
    ] as const

    await mkdir(path.join(root, 'public'), { recursive: true })
    await Promise.all([
      writeFile(path.join(root, 'public', 'asset.png'), 'asset'),
      ...cases.map(({ name, source }) =>
        writeFile(path.join(root!, `${name}.md`), source)
      )
    ])

    const siteConfig = await resolveConfig(root, 'build', 'production')
    const render = await createMarkdownToVueRenderFn(
      siteConfig.srcDir,
      { cache: false },
      '/',
      false,
      false,
      siteConfig
    )

    for (const { name, source, expected } of cases) {
      const result = await render(source, path.join(root, `${name}.md`))
      expect(result.html).not.toBe('')
      expect(result.staticPage, name).toBe(expected ? true : undefined)
      if (name === 'plain') {
        expect(result.staticHtml).toBeUndefined()
      }
      if (name === 'highlighted-code') {
        expect(result.html).toContain('v-pre')
        expect(result.staticHtml).toBeUndefined()
        expect(prepareStaticHtmlForSsr(result.html)).not.toContain('v-pre')
      }
      if (name === 'default-theme-badge') {
        expect(result.staticHtml).toContain(
          '<span class="VPBadge warning"><!--[-->1.2.3<!--]--></span>'
        )
        const clientSource = createStaticPageVueSource(result)
        expect(clientSource).toContain(
          "import { createStaticVNode } from 'vue'"
        )
        expect(clientSource).toContain('VPBadge warning')
      }
      if (
        name === 'sfc-block' ||
        name === 'scoped-style' ||
        name === 'css-module'
      ) {
        expect(result.requiresSourceModuleIdentity).toBe(true)
        expect(
          canCompileSsrPageArtifact(
            siteConfig,
            path.join(root, `${name}.md`),
            result
          )
        ).toBe(false)
      }
    }
  })

  test('does not fold Badge markup from a custom theme', async () => {
    root = await mkdtemp(path.join(tmpdir(), 'vitepress-custom-badge-'))
    await mkdir(path.join(root, '.vitepress/theme'), { recursive: true })
    const file = path.join(root, 'index.md')
    const source = '# Custom Badge <Badge type="warning">custom</Badge>'
    await writeFile(file, source)

    const siteConfig = await resolveConfig(root, 'build', 'production')
    const render = await createMarkdownToVueRenderFn(
      siteConfig.srcDir,
      { cache: false },
      '/',
      false,
      false,
      siteConfig
    )

    const result = await render(source, file)

    expect(result.staticPage).toBeUndefined()
    expect(result.html).toContain('<Badge type="warning">custom</Badge>')
  })

  test('does not bypass resolved renderBuiltUrl for public assets', async () => {
    root = await mkdtemp(path.join(tmpdir(), 'vitepress-built-url-static-'))
    await mkdir(path.join(root, 'public'), { recursive: true })
    const file = path.join(root, 'index.md')
    const source = '# Asset\n\n![asset](/asset.png)'
    await Promise.all([
      writeFile(file, source),
      writeFile(path.join(root, 'public', 'asset.png'), 'asset')
    ])

    const siteConfig = await resolveConfig(root, 'build', 'production')
    siteConfig.vite = {
      experimental: {
        renderBuiltUrl(filename) {
          return `/cdn/${filename}`
        }
      }
    }
    const render = await createMarkdownToVueRenderFn(
      siteConfig.srcDir,
      { cache: false },
      '/',
      false,
      false,
      siteConfig
    )

    const result = await render(source, file)
    expect(result.staticPage).toBeUndefined()
    expect(result.requiresSourceModuleIdentity).toBeUndefined()
  })

  test('reuses only explicitly environment-invariant Markdown pre transforms', async () => {
    root = await mkdtemp(path.join(tmpdir(), 'vitepress-static-transform-'))
    const file = path.join(root, 'index.md')
    const source = '# Source transform\n'
    await writeFile(file, source)

    const siteConfig = await resolveConfig(root, 'build', 'production')
    siteConfig.vite = {
      plugins: [
        {
          name: 'source-only-markdown',
          enforce: 'pre',
          api: { vitepress: { ssrArtifactSafe: true } },
          transform: {
            filter: { id: /[.]md$/ },
            handler(code) {
              return `${code}\ntransformed`
            }
          }
        }
      ]
    }
    const render = await createMarkdownToVueRenderFn(
      siteConfig.srcDir,
      { cache: false },
      '/',
      false,
      false,
      siteConfig
    )

    expect(canCompileSsrPageArtifact(siteConfig, file)).toBe(true)
    const result = await render(source, file)
    expect(result.staticPage).toBe(true)
  })

  test('keeps SSR-sensitive source transforms on the physical path', async () => {
    root = await mkdtemp(path.join(tmpdir(), 'vitepress-ssr-transform-'))
    const file = path.join(root, 'index.md')
    const source = '# Environment-sensitive transform\n'
    await writeFile(file, source)

    const siteConfig = await resolveConfig(root, 'build', 'production')
    siteConfig.vite = {
      plugins: [
        {
          name: 'ssr-sensitive-markdown',
          enforce: 'pre',
          transform: {
            filter: { id: /[.]md$/ },
            handler(code, _id, options) {
              return `${code}\n${options?.ssr ? 'server' : 'client'}`
            }
          }
        }
      ]
    }
    const render = await createMarkdownToVueRenderFn(
      siteConfig.srcDir,
      { cache: false },
      '/',
      false,
      false,
      siteConfig
    )

    expect(canCompileSsrPageArtifact(siteConfig, file)).toBe(false)
    const result = await render(source, file)
    expect(result.staticPage).toBeUndefined()
    expect(result.requiresSourceModuleIdentity).toBe(true)
    expect(canCompileSsrPageArtifact(siteConfig, file, result)).toBe(false)
  })

  test('keeps applicable resolve and load hooks on the physical non-static path', async () => {
    root = await mkdtemp(path.join(tmpdir(), 'vitepress-module-hooks-'))
    const file = path.join(root, 'index.md')
    const source = '# Module hooks\n'
    await writeFile(file, source)

    const siteConfig = await resolveConfig(root, 'build', 'production')
    const plugins = [
      {
        name: 'resolve-page-dependency',
        resolveId: {
          filter: { id: /[.]json$/ },
          handler() {
            return null
          }
        }
      },
      {
        name: 'load-artifact-vue',
        load: {
          filter: { id: /[.]__vitepress_ssr[.]vue$/ },
          handler() {
            return null
          }
        }
      }
    ]

    for (const plugin of plugins) {
      siteConfig.vite = { plugins: [plugin] }
      expect(canCompileSsrPageArtifact(siteConfig, file)).toBe(false)

      const render = await createMarkdownToVueRenderFn(
        siteConfig.srcDir,
        { cache: false },
        '/',
        false,
        false,
        siteConfig
      )
      const result = await render(source, file)
      expect(result.staticPage).toBe(true)
      expect(result.requiresSourceModuleIdentity).toBe(true)
    }
  })

  test('treats filtered load hooks as potentially applicable to page dependencies', async () => {
    root = await mkdtemp(path.join(tmpdir(), 'vitepress-filtered-hooks-'))
    const file = path.join(root, 'index.md')
    await writeFile(file, '# Filtered hooks\n')

    const siteConfig = await resolveConfig(root, 'build', 'production')
    siteConfig.vite = {
      plugins: [
        {
          name: 'json-only-load',
          load: {
            filter: { id: /[.]json$/ },
            handler() {
              return null
            }
          }
        }
      ]
    }

    expect(canCompileSsrPageArtifact(siteConfig, file)).toBe(false)

    siteConfig.vite = {
      plugins: [
        {
          name: 'serve-only-load',
          apply: 'serve',
          load() {
            return null
          }
        }
      ]
    }
    expect(canCompileSsrPageArtifact(siteConfig, file)).toBe(true)
  })

  test('treats promised plugins as opaque for artifact module identities', async () => {
    root = await mkdtemp(path.join(tmpdir(), 'vitepress-promised-hooks-'))
    const file = path.join(root, 'index.md')
    await writeFile(file, '# Promised hooks\n')

    const siteConfig = await resolveConfig(root, 'build', 'production')
    siteConfig.vite = {
      plugins: [
        Promise.resolve({
          name: 'promised-load-hook',
          load() {
            return null
          }
        })
      ]
    }

    expect(canCompileSsrPageArtifact(siteConfig, file)).toBe(false)
  })

  test('keeps normal Markdown transforms on the physical compiled path', async () => {
    root = await mkdtemp(path.join(tmpdir(), 'vitepress-static-transform-'))
    const file = path.join(root, 'index.md')
    const source = '# Generated-SFC transform\n'
    await writeFile(file, source)

    const siteConfig = await resolveConfig(root, 'build', 'production')
    siteConfig.vite = {
      plugins: [
        {
          name: 'generated-sfc-markdown',
          transform: {
            filter: { id: /[.]md$/ },
            handler(code) {
              return `${code}\ntransformed`
            }
          }
        }
      ]
    }
    const render = await createMarkdownToVueRenderFn(
      siteConfig.srcDir,
      { cache: false },
      '/',
      false,
      false,
      siteConfig
    )

    const result = await render(source, file)
    expect(result.staticPage).toBeUndefined()
  })
})

function readEmbeddedPageData(vueSrc: string) {
  const encoded = vueSrc.match(
    /export const __pageData = JSON\.parse\(("(?:[^"\\]|\\.)*")\)/
  )?.[1]
  expect(encoded).toBeTruthy()
  return JSON.parse(JSON.parse(encoded!))
}
