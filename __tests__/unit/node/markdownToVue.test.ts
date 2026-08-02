import { resolveConfig } from 'node/config'
import { createMarkdownToVueRenderFn } from 'node/markdownToVue'
import { PageArtifactStore } from 'node/build/artifacts/store'
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

  test('records source line numbers for dead links after frontmatter', async () => {
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

    expect((await render(src, file)).deadLinks).toContainEqual({
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
        '## Target',
        '',
        'target text',
        '',
        '### Child',
        '',
        'child text',
        '',
        '## Other',
        '',
        'other text'
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
    const result = await render(src, file)

    expect(result.vueSrc).toContain('<p>target text</p>')
    expect(result.vueSrc).toContain('<h3 id="child"')
    expect(result.vueSrc).toContain('<p>child text</p>')
    expect(result.vueSrc).not.toContain('Source description')
    expect(result.vueSrc).not.toContain('intro text')
    expect(result.vueSrc).not.toContain('other text')
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

    expect(
      (await render('# Home\n', 'C:/site/docs/en/index.md')).pageData
        .relativePath
    ).toBe('index.md')
  })

  test('refreshes page data after hooks without mutating the base artifact', async () => {
    root = await mkdtemp(path.join(tmpdir(), 'vitepress-page-data-'))
    const file = path.join(root, 'index.md')
    const src = '---\nnested:\n  value: 1\n---\n# Original\n'
    await writeFile(file, src)

    const siteConfig = await resolveConfig(root, 'build', 'production')
    siteConfig.transformPageData = vi.fn(async (pageData) => {
      ;(pageData.frontmatter.nested as { value: number }).value = 2
      return { title: 'Current title', relativePath: 'current.md' }
    })
    const render = await createMarkdownToVueRenderFn(
      siteConfig.srcDir,
      { cache: false },
      '/',
      false,
      false,
      siteConfig,
      false,
      true,
      true
    )

    const base = await render(src, file)
    const finalized = await render.finalize(base, file)

    expect(siteConfig.transformPageData).toHaveBeenCalledTimes(1)
    expect(base.pageData).toMatchObject({
      title: 'Original',
      relativePath: 'index.md',
      frontmatter: { nested: { value: 1 } }
    })
    expect(finalized.pageData).toMatchObject({
      title: 'Current title',
      relativePath: 'current.md',
      frontmatter: { nested: { value: 2 } }
    })
    expect(readEmbeddedPageData(finalized.vueSrc)).toEqual(finalized.pageData)
    expect(finalized.vueSrc).toContain('export default {name:"current.md"}')
  })

  test('shares and finalizes a Markdown artifact within the current build', async () => {
    root = await mkdtemp(path.join(tmpdir(), 'vitepress-page-artifact-'))
    const file = path.join(root, 'index.md')
    const src = '# Original\n'
    await writeFile(file, src)

    const siteConfig = await resolveConfig(root, 'build', 'production')
    siteConfig.transformPageData = vi.fn(() => ({ title: 'Finalized' }))
    const render = await createMarkdownToVueRenderFn(
      siteConfig.srcDir,
      { cache: false },
      '/',
      false,
      false,
      siteConfig,
      false,
      true,
      true
    )
    const compile = vi.fn(() => render(src, file))
    const store = new PageArtifactStore(path.join(root, '.artifacts'))

    const first = await store.getOrCreate(
      'index.md',
      src,
      compile,
      (artifact) => render.finalize(artifact, file)
    )
    const second = await store.getOrCreate(
      'index.md',
      src,
      compile,
      (artifact) => render.finalize(artifact, file)
    )

    expect(compile).toHaveBeenCalledTimes(1)
    expect(siteConfig.transformPageData).toHaveBeenCalledTimes(1)
    expect(first.pageData.title).toBe('Finalized')
    expect(second).toEqual(first)
  })
})

function readEmbeddedPageData(vueSrc: string) {
  const encoded = vueSrc.match(
    /export const __pageData = JSON\.parse\(("(?:[^"\\]|\\.)*")\)/
  )?.[1]
  expect(encoded).toBeTruthy()
  return JSON.parse(JSON.parse(encoded!))
}
