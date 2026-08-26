import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { resolveConfig } from 'node/config'
import { disposeMdItInstance } from 'node/markdown/markdown'
import { createMarkdownToVueRenderFn } from 'node/markdownToVue'

describe('node/markdownToVue', () => {
  let root: string | undefined

  beforeEach(() => {
    // the markdown renderer is a module-level singleton — reset it so each
    // test's options actually reach it
    disposeMdItInstance()
  })

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
    siteConfig.markdown = { cache: false }
    const render = await createMarkdownToVueRenderFn(
      siteConfig.srcDir,
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
    siteConfig.markdown = { cache: false }
    const render = await createMarkdownToVueRenderFn(
      siteConfig.srcDir,
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
    siteConfig.markdown = { cache: false }
    const render = await createMarkdownToVueRenderFn(
      siteConfig.srcDir,
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

  test('reads markdown options when the renderer is created', async () => {
    root = await mkdtemp(path.join(tmpdir(), 'vitepress-md-options-'))

    const file = path.join(root, 'index.md')
    const src = '# Home\n'
    await writeFile(file, src)

    const siteConfig = await resolveConfig(root, 'build', 'production')
    const render = await createMarkdownToVueRenderFn(
      siteConfig.srcDir,
      '/',
      false,
      false,
      siteConfig
    )

    // a vite plugin extending the markdown options from its own configResolved
    // hook, i.e. after the render fn has been created but before it is used
    siteConfig.markdown = {
      cache: false,
      config: (md) => {
        md.renderer.rules.text = (tokens, idx) =>
          `${tokens[idx].content}__MARKER__`
      }
    }

    const result = await render(src, file)

    expect(result.vueSrc).toContain('Home__MARKER__')
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

    siteConfig.markdown = { cache: false }
    const render = await createMarkdownToVueRenderFn(
      siteConfig.srcDir,
      '/',
      false,
      false,
      siteConfig
    )

    const result = await render('# Home\n', 'C:/site/docs/en/index.md')

    expect(result.pageData.relativePath).toBe('index.md')
  })
})
