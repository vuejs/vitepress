import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { resolveConfig } from 'node/config'
import { disposeMdItInstance } from 'node/markdown/markdown'
import { clearCache, createMarkdownToVueRenderFn } from 'node/markdownToVue'

describe('node/markdownToVue cache invalidation', () => {
  let root: string

  beforeEach(async () => {
    clearCache()
    disposeMdItInstance()
    root = await mkdtemp(path.join(tmpdir(), 'vitepress-md-cache-'))
  })

  afterEach(async () => {
    clearCache()
    disposeMdItInstance()
    await rm(root, { recursive: true, force: true })
  })

  test.each([
    ['include', '<!-- @include: ./shared.md -->'],
    ['snippet', '<<< ./shared.md{txt}']
  ])(
    'invalidates every source version when its %s changes',
    async (_, importSrc) => {
      const file = path.join(root, 'page.md')
      const otherFile = path.join(root, 'other-page.md')
      const sharedFile = path.join(root, 'shared.md')
      const sources = ['First', 'Second', 'Third'].map(
        (title) => `# ${title}\n\n${importSrc}\n`
      )
      await writeFile(file, sources[0])
      await writeFile(otherFile, '# Other page')
      await writeFile(sharedFile, 'old shared content')

      const config = await resolveConfig(root, 'serve', 'development')
      const render = await createMarkdownToVueRenderFn(
        config.srcDir,
        { highlight: (code) => code },
        '/',
        false,
        false,
        config
      )

      // Editing the page creates several cached versions of the same path.
      const first = await render(sources[0], file)
      expect(await render(sources[0], file)).toBe(first)
      await render(sources[1], file)
      const other = await render('# Other page', otherFile)
      await render(sources[2], file)

      await writeFile(sharedFile, 'updated shared content')
      // The include/snippet HMR handler invalidates each importing page by path.
      clearCache('page.md')

      // Undoing a page edit must not revive a stale version of the dependency.
      for (const src of [...sources].reverse()) {
        const result = await render(src, file)
        expect(result.vueSrc).toContain('updated shared content')
        expect(result.vueSrc).not.toContain('old shared content')
      }
      expect(await render('# Other page', otherFile)).toBe(other)
    }
  )
})
