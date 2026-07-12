import MiniSearch from 'minisearch'
import { resolveConfig } from 'node/config'
import { localSearchPlugin } from 'node/plugins/localSearchPlugin'
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

    const indexModule = (await plugin.load?.call(
      {} as never,
      '/@localSearchIndex'
    )) as string

    expect(indexModule).toContain(
      '"root": () => import(\'@localSearchIndexroot\')'
    )
    expect(indexModule).toContain('"zh": () => import(\'@localSearchIndexzh\')')

    const rootIndex = loadIndex(
      (await plugin.load?.call({} as never, '/@localSearchIndexroot')) as string
    )
    const zhIndex = loadIndex(
      (await plugin.load?.call({} as never, '/@localSearchIndexzh')) as string
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
