import MiniSearch from 'minisearch'
import type { MarkdownItAsync } from 'markdown-it-async'
import { resolveConfig } from 'node/config'
import type { MarkdownCompileResult } from 'node/markdownToVue'
import { PageArtifactStore } from 'node/build/artifacts/store'
import { localSearchPlugin } from 'node/plugins/localSearchPlugin'
import type { MarkdownEnv } from 'node/shared'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

describe('node/plugins/localSearchPlugin', () => {
  let root: string | undefined
  let nodeEnv: string | undefined

  beforeEach(() => {
    nodeEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'
  })

  afterEach(async () => {
    if (nodeEnv === undefined) {
      delete process.env.NODE_ENV
    } else {
      process.env.NODE_ENV = nodeEnv
    }

    if (root) {
      await rm(root, { recursive: true, force: true })
      root = undefined
    }
  })

  test('indexes rewritten pages by rewritten locale path', async () => {
    root = await mkdtemp(path.join(tmpdir(), 'vitepress-local-search-'))
    const configDir = path.join(root, '.vitepress')
    await mkdir(configDir)

    await writeFile(
      path.join(root, 'index.md'),
      '# English home\n\nrootonlytoken\n'
    )
    await writeFile(
      path.join(root, 'zh.md'),
      '# Chinese home\n\nlocaleonlytoken\n'
    )
    await writeFile(
      path.join(configDir, 'config.ts'),
      [
        'export default {',
        '  rewrites: {',
        "    'index.md': 'guide.md',",
        "    'zh.md': 'zh/guide.md'",
        '  },',
        '  locales: {',
        "    root: { label: 'English', lang: 'en' },",
        "    zh: { label: 'Chinese', lang: 'zh' }",
        '  },',
        '  themeConfig: {',
        "    search: { provider: 'local' }",
        '  }',
        '}'
      ].join('\n')
    )

    const siteConfig = await resolveConfig(root, 'build', 'production')
    const plugin = await localSearchPlugin(siteConfig)

    // vite calls configResolved before any other hook
    await (plugin.configResolved as any)?.call(
      {},
      { publicDir: siteConfig.publicDir }
    )

    const indexModule = (await (plugin.load as any)?.handler.call(
      {},
      '/@localSearchIndex'
    )) as string

    expect(indexModule).toContain(
      '"root": () => import(\'@localSearchIndexroot\')'
    )
    expect(indexModule).toContain('"zh": () => import(\'@localSearchIndexzh\')')

    const rootIndex = loadIndex(
      (await (plugin.load as any)?.handler.call(
        {},
        '/@localSearchIndexroot'
      )) as string
    )
    const zhIndex = loadIndex(
      (await (plugin.load as any)?.handler.call(
        {},
        '/@localSearchIndexzh'
      )) as string
    )

    expect(rootIndex.search('rootonlytoken')).toMatchObject([
      { id: '/guide.html#english-home' }
    ])
    expect(rootIndex.search('localeonlytoken')).toEqual([])

    expect(zhIndex.search('localeonlytoken')).toMatchObject([
      { id: '/zh/guide.html#chinese-home' }
    ])
    expect(zhIndex.search('rootonlytoken')).toEqual([])
  })

  test('falls back to custom _render hooks when an artifact is available', async () => {
    root = await mkdtemp(path.join(tmpdir(), 'vitepress-local-search-hook-'))
    const source = '# Search hook\n\nsearchhooktoken\n'
    await writeFile(path.join(root, 'index.md'), source)

    const siteConfig = await resolveConfig(root, 'build', 'production')
    const renderHook = vi.fn(
      async (src: string, env: MarkdownEnv, md: MarkdownItAsync) =>
        md.renderAsync(src, env)
    )
    siteConfig.site.themeConfig = {
      search: { provider: 'local', options: { _render: renderHook } }
    }

    const artifact: MarkdownCompileResult = {
      vueSrc: '<template><div><h1>Search hook</h1></div></template>',
      html: '<h1 id="search-hook">Search hook<a href="#search-hook"></a></h1>',
      pageData: {
        title: 'Search hook',
        description: '',
        frontmatter: {},
        headers: [],
        relativePath: 'index.md',
        filePath: 'index.md'
      },
      deadLinks: [],
      includes: []
    }
    const store = new PageArtifactStore(path.join(root, '.artifacts'))
    await store.getOrCreate('index.md', source, async () => artifact)

    const plugin = await localSearchPlugin(siteConfig, false, store)
    ;(plugin.configResolved as any)?.call(
      {},
      { publicDir: siteConfig.publicDir }
    )
    await (plugin.load as any).handler.call({}, '/@localSearchIndex')

    expect(renderHook).toHaveBeenCalledTimes(1)
  })
})

function loadIndex(serializedModule: string) {
  const serializedIndex = JSON.parse(
    serializedModule.slice('export default '.length)
  )
  return MiniSearch.loadJSON(serializedIndex, {
    fields: ['title', 'titles', 'text'],
    storeFields: ['title', 'titles']
  })
}
