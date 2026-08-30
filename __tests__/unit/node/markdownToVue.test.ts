import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { resolveConfig } from 'node/config'
import { disposeMdItInstance } from 'node/markdown/markdown'
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
      siteConfig,
      false
    )

    const result = await render(src, file)

    expect(result.deadLinks).toContainEqual({
      url: './missing.md',
      resolved: '/missing',
      file,
      line: 5,
      column: 1
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
      siteConfig,
      false
    )

    const result = await render(src, file)

    expect(result.deadLinks).toContainEqual({
      url: './missing.md',
      resolved: '/missing',
      file,
      line: 8,
      column: 1
    })
  })

  test('reports dead links inside included files at their real location', async () => {
    root = await mkdtemp(path.join(tmpdir(), 'vitepress-dead-link-'))

    const file = path.join(root, 'index.md')
    const partial = path.join(root, 'part.md')
    await writeFile(
      partial,
      '---\nt: 1\n---\nSome text\n[x](./nope)\nMore text\n'
    )
    const src =
      '---\ntitle: x\n---\n\n# Guide\n\n<!-- @include: ./part.md -->\n\npara [a](./a)\nand [b](./b)\n'
    await writeFile(file, src)

    const siteConfig = await resolveConfig(root, 'build', 'production')
    const render = await createMarkdownToVueRenderFn(
      siteConfig.srcDir,
      { cache: false },
      '/',
      false,
      false,
      siteConfig,
      false
    )

    const result = await render(src, file)

    expect(result.deadLinks).toEqual([
      {
        url: './nope',
        resolved: '/nope',
        file: partial,
        line: 5,
        column: 1,
        via: file
      },
      { url: './a', resolved: '/a', file, line: 9, column: 6 },
      { url: './b', resolved: '/b', file, line: 10, column: 5 }
    ])
  })

  test('reports the URL as authored alongside the resolved path', async () => {
    root = await mkdtemp(path.join(tmpdir(), 'vitepress-dead-link-'))

    const file = path.join(root, 'index.md')
    const src = '[a](./a.md)\n\n[b](./b#hash)\n\n[c](./中文.md)\n\n[d](/d)\n'
    await writeFile(file, src)

    const siteConfig = await resolveConfig(root, 'build', 'production')
    const render = await createMarkdownToVueRenderFn(
      siteConfig.srcDir,
      { cache: false },
      '/',
      false,
      false,
      siteConfig,
      false
    )

    const result = await render(src, file)

    expect(
      result.deadLinks.map(({ url, resolved }) => ({ url, resolved }))
    ).toEqual([
      { url: './a.md', resolved: '/a' },
      { url: './b#hash', resolved: '/b' },
      { url: './中文.md', resolved: '/中文' },
      { url: '/d', resolved: '/d' }
    ])
  })

  test('passes the authored link and its context to ignoreDeadLinks filters', async () => {
    root = await mkdtemp(path.join(tmpdir(), 'vitepress-dead-link-'))

    const file = path.join(root, 'index.md')
    const src = '[s](./skip.md)\nand [k](./keep.md)\n'
    await writeFile(file, src)

    const siteConfig = await resolveConfig(root, 'build', 'production')
    const calls: unknown[] = []
    siteConfig.ignoreDeadLinks = [
      (link, context) => {
        calls.push([link, context])
        return link === './skip.md'
      }
    ]
    const render = await createMarkdownToVueRenderFn(
      siteConfig.srcDir,
      { cache: false },
      '/',
      false,
      false,
      siteConfig,
      false
    )

    const result = await render(src, file)

    expect(calls).toEqual([
      ['./skip.md', { file, line: 1, column: 1, url: '/skip' }],
      ['./keep.md', { file, line: 2, column: 5, url: '/keep' }]
    ])
    expect(result.deadLinks.map((l) => l.url)).toEqual(['./keep.md'])
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
      siteConfig,
      false
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
      siteConfig,
      false
    )

    const result = await render('# Home\n', 'C:/site/docs/en/index.md')

    expect(result.pageData.relativePath).toBe('index.md')
  })

  test('warns when transformPageData rewrites an interpolated value', async () => {
    disposeMdItInstance()
    root = await mkdtemp(path.join(tmpdir(), 'vitepress-eager-'))

    const file = path.join(root, 'index.md')
    const src = '---\ntitle: Old\n---\n\n# {{ $frontmatter.title }}\n'
    await writeFile(file, src)

    const siteConfig = await resolveConfig(root, 'build', 'production')
    const warnings: string[] = []
    siteConfig.logger = {
      ...siteConfig.logger,
      warn: (msg: string) => warnings.push(msg)
    }
    siteConfig.transformPageData = (pageData) => {
      pageData.frontmatter.title = 'New'
    }

    const render = await createMarkdownToVueRenderFn(
      siteConfig.srcDir,
      { cache: false },
      '/',
      false,
      false,
      siteConfig,
      false
    )

    const result = await render(src, file)
    expect(result.vueSrc).toContain('Old')
    expect(warnings.join('\n')).toContain('{{ $frontmatter.title }}')

    // keys only added by the transform are left to the runtime - no warning
    warnings.length = 0
    siteConfig.transformPageData = (pageData) => {
      pageData.frontmatter.added = 'later'
    }
    const src2 =
      '---\ntitle: Old\n---\n\n{{ $frontmatter.title }} {{ $frontmatter.added }}\n'
    await writeFile(file, src2)
    await render(src2, file)
    expect(warnings).toHaveLength(0)
  })
})
