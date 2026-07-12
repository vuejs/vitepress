import { resolveConfig } from 'node/config'
import { createMarkdownToVueRenderFn } from 'node/markdownToVue'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
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

    const result = await render(src, file, 'public')

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

    const result = await render(
      '# Home\n',
      'C:/site/docs/en/index.md',
      'public'
    )

    expect(result.pageData.relativePath).toBe('index.md')
  })
})
