import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { resolveConfig } from 'node/config'
import { dynamicRoutesPlugin } from 'node/plugins/dynamicRoutesPlugin'

describe('node/plugins/dynamicRoutesPlugin', () => {
  let root: string | undefined

  afterEach(async () => {
    if (root) {
      await rm(root, { recursive: true, force: true })
      root = undefined
    }
    delete (globalThis as any).__pathsLoaderCalls
    delete (global as any).VITEPRESS_CONFIG
  })

  test('negated watch patterns exclude files from hot updates', async () => {
    root = await mkdtemp(path.join(tmpdir(), 'vitepress-dynamic-routes-'))
    await mkdir(path.join(root, 'data'))
    await writeFile(path.join(root, 'data/a.json'), '{}')
    await writeFile(path.join(root, 'data/skip.json'), '{}')
    await writeFile(path.join(root, 'index.md'), '# Home')
    await writeFile(path.join(root, '[name].md'), '# {{ $params.name }}')
    await writeFile(
      path.join(root, '[name].paths.mjs'),
      [
        'import path from "node:path"',
        'export default {',
        "  watch: ['./data/*.json', '!./data/skip.json'],",
        '  paths(files) {',
        '    globalThis.__pathsLoaderCalls = (globalThis.__pathsLoaderCalls ?? 0) + 1',
        "    return files.map((file) => ({ params: { name: path.basename(file, '.json') } }))",
        '  }',
        '}'
      ].join('\n')
    )

    const siteConfig = await resolveConfig(root, 'serve', 'development')
    expect(siteConfig.pages).toEqual(['a.md', 'index.md'])

    const plugin = await dynamicRoutesPlugin(siteConfig)
    const loaderCalls = () => (globalThis as any).__pathsLoaderCalls
    const hotUpdate = (file: string) =>
      (plugin.hotUpdate as any).call(
        {
          environment: {
            name: 'client',
            moduleGraph: { getModulesByFile: () => undefined }
          }
        },
        { file: path.join(root!, file), modules: [] }
      )

    expect(loaderCalls()).toBe(1)
    await hotUpdate('data/a.json')
    expect(loaderCalls()).toBe(2)
    await hotUpdate('data/skip.json')
    expect(loaderCalls()).toBe(2)
    await hotUpdate('index.md')
    expect(loaderCalls()).toBe(2)
  })
})
