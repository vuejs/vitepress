import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { staticDataPlugin } from 'node/plugins/staticDataPlugin'
import { normalizePath } from 'vite'

describe('node/plugins/staticDataPlugin', () => {
  let root: string | undefined

  afterEach(async () => {
    if (root) {
      await rm(root, { recursive: true, force: true })
      root = undefined
    }
  })

  test('negated watch patterns exclude files from hot updates', async () => {
    root = await mkdtemp(path.join(tmpdir(), 'vitepress-static-data-'))
    await mkdir(path.join(root, 'posts'))
    await writeFile(path.join(root, 'posts/a.md'), '# A')
    await writeFile(path.join(root, 'posts/draft.md'), '# Draft')
    await writeFile(path.join(root, 'other.md'), '# Other')
    await writeFile(
      path.join(root, 'posts.data.mjs'),
      [
        'import path from "node:path"',
        'export default {',
        "  watch: ['./posts/*.md', '!./posts/draft.md'],",
        '  load: (files) => files.map((file) => path.basename(file))',
        '}'
      ].join('\n')
    )

    const id = normalizePath(path.join(root, 'posts.data.mjs'))
    ;(staticDataPlugin.configResolved as any)({ command: 'serve' })
    ;(staticDataPlugin.configureServer as any)({ watcher: { add() {} } })

    const code = await (staticDataPlugin.load as any).handler(id)
    expect(code).toContain('a.md')
    expect(code).not.toContain('draft.md')

    const hotUpdate = (file: string) =>
      (staticDataPlugin.hotUpdate as any).call(
        {
          environment: {
            name: 'client',
            moduleGraph: { getModuleById: (id: string) => ({ id }) }
          }
        },
        { file: path.join(root!, file), modules: [] }
      )

    expect(hotUpdate('posts/a.md')).toEqual([{ id }])
    expect(hotUpdate('posts/draft.md')).toBeUndefined()
    expect(hotUpdate('other.md')).toBeUndefined()
  })
})
