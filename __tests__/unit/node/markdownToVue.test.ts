import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { resolveConfig } from 'node/config'
import { createMarkdownToVueRenderFn } from 'node/markdownToVue'

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

    const result = await render(src, file, 'public')

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

    const result = await render(src, file, 'public')

    expect(result.deadLinks).toContainEqual({
      url: './missing',
      file,
      line: 8
    })
  })
})
