import MiniSearch from 'minisearch'
import { resolveConfig } from 'node/config'
import { disposeMdItInstance } from 'node/markdown/markdown'
import { createMarkdownToVueRenderFn } from 'node/markdownToVue'
import { localSearchPlugin } from 'node/plugins/localSearchPlugin'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

describe('node/plugins/localSearchPlugin', () => {
  let root: string | undefined
  let nodeEnv: string | undefined

  beforeEach(() => {
    nodeEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'
    // createMarkdownRenderer is a module-level singleton keyed on nothing —
    // reset it so each test's config actually reaches the renderer
    disposeMdItInstance()
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
      path.join(configDir, 'config.mjs'),
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

  test('applies per-locale markdown options (#5350)', async () => {
    root = await mkdtemp(path.join(tmpdir(), 'vitepress-local-search-'))
    const configDir = path.join(root, '.vitepress')
    await mkdir(configDir)
    await mkdir(path.join(root, 'zh'))

    const content = '::: tip\ntipcontent\n:::\n'
    await writeFile(path.join(root, 'index.md'), `# Home\n\n${content}`)
    await writeFile(
      path.join(root, 'zh', 'index.md'),
      `# Chinese home\n\n${content}`
    )
    await writeFile(
      path.join(configDir, 'config.mjs'),
      [
        'export default {',
        '  locales: {',
        "    root: { label: 'English', lang: 'en' },",
        '    zh: {',
        "      label: 'Chinese',",
        "      lang: 'zh',",
        "      markdown: { container: { tipLabel: 'zhtiplabel' } }",
        '    }',
        '  },',
        '  themeConfig: {',
        "    search: { provider: 'local' }",
        '  }',
        '}'
      ].join('\n')
    )

    const siteConfig = await resolveConfig(root, 'build', 'production')
    const plugin = await localSearchPlugin(siteConfig)

    // configResolved hooks run concurrently, so the search plugin may be the
    // one that creates the shared markdown renderer — page renders must still
    // pick up per-locale options from it
    await (plugin.configResolved as any)?.call(
      {},
      { publicDir: siteConfig.publicDir }
    )

    const render = await createMarkdownToVueRenderFn(
      siteConfig.srcDir,
      siteConfig.markdown ?? {},
      siteConfig.site.base,
      false,
      false,
      siteConfig
    )

    const rootFile = path.join(root, 'index.md')
    const zhFile = path.join(root, 'zh', 'index.md')
    const rootPage = await render(await readFile(rootFile, 'utf-8'), rootFile)
    const zhPage = await render(await readFile(zhFile, 'utf-8'), zhFile)
    expect(rootPage.vueSrc).toContain('TIP')
    expect(zhPage.vueSrc).toContain('zhtiplabel')

    // the indexed text must use the localized labels too
    await (plugin.load as any)?.handler.call({}, '/@localSearchIndex')
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
    expect(zhIndex.search('zhtiplabel')).toHaveLength(1)
    expect(rootIndex.search('zhtiplabel')).toEqual([])
    expect(rootIndex.search('tip')).toHaveLength(1)
  })

  test('warns and skips pages that fail to render', async () => {
    root = await mkdtemp(path.join(tmpdir(), 'vitepress-local-search-'))
    const configDir = path.join(root, '.vitepress')
    await mkdir(configDir)

    await writeFile(path.join(root, 'index.md'), '# Home\n\nhealthytoken\n')
    await writeFile(
      path.join(root, 'broken.md'),
      '# Broken\n\n<!-- @include: ./missing.md -->\n'
    )
    await writeFile(
      path.join(configDir, 'config.mjs'),
      "export default { themeConfig: { search: { provider: 'local' } } }"
    )

    const siteConfig = await resolveConfig(root, 'build', 'production')
    const warn = vi
      .spyOn(siteConfig.logger, 'warn')
      .mockImplementation(() => {})
    const plugin = await localSearchPlugin(siteConfig)

    await (plugin.configResolved as any)?.call(
      {},
      { publicDir: siteConfig.publicDir }
    )

    // the include throws, but indexing the remaining pages must still resolve —
    // in dev this runs unawaited and a rejection would take the server down
    await (plugin.load as any)?.handler.call({}, '/@localSearchIndex')

    const index = loadIndex(
      (await (plugin.load as any)?.handler.call(
        {},
        '/@localSearchIndexroot'
      )) as string
    )

    expect(index.search('healthytoken')).toHaveLength(1)
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('Failed to index broken.md for search')
    )
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
