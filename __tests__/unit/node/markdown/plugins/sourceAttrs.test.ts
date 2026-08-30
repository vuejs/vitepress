import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { resolveConfig } from 'node/config'
import {
  disposeMdItInstance,
  type MarkdownOptions
} from 'node/markdown/markdown'
import { createMarkdownToVueRenderFn } from 'node/markdownToVue'
import { slash } from 'node/shared'

describe('node/markdown/plugins/sourceAttrs', () => {
  let root: string

  beforeEach(async () => {
    root = await mkdtemp(path.join(tmpdir(), 'vitepress-source-attrs-'))
  })

  afterEach(async () => {
    await rm(root, { recursive: true, force: true })
  })

  function rel(file: string) {
    return slash(path.relative(process.cwd(), file))
  }

  async function renderPage(
    files: Record<string, string>,
    { dev = true, markdown = {} as MarkdownOptions } = {}
  ) {
    disposeMdItInstance()
    for (const [name, text] of Object.entries(files)) {
      await writeFile(path.join(root, name), text)
    }
    const file = path.join(root, 'index.md')
    const siteConfig = await resolveConfig(root, 'build', 'production')
    const render = await createMarkdownToVueRenderFn(
      siteConfig.srcDir,
      { cache: false, ...markdown },
      '/',
      false,
      false,
      siteConfig,
      dev
    )
    return { vueSrc: (await render(files['index.md'], file)).vueSrc, file }
  }

  test('stamps block elements with their source location in dev', async () => {
    const { vueSrc, file } = await renderPage({
      'index.md':
        '---\nt: 1\n---\n\n# Head\n\npara\n\n::: tip\nboxed\n:::\n\n```ts\ncode\n```\n\n> [!NOTE]\n> alert\n'
    })
    const at = (line: number) => `data-v-inspector="${rel(file)}:${line}:1"`
    expect(vueSrc).toContain(at(5)) // heading
    expect(vueSrc).toContain(at(7)) // paragraph
    expect(vueSrc).toContain(at(9)) // container
    expect(vueSrc).toContain(`<div class="language-ts" ${at(13)}`) // fence wrapper
    expect(vueSrc).toContain(
      `<div class="note custom-block github-alert" ${at(17)}` // gh alert
    )
  })

  test('locations resolve into included files', async () => {
    const { vueSrc } = await renderPage({
      'part.md': '## From partial\n',
      'index.md': '# Page\n\n<!-- @include: ./part.md -->\n'
    })
    expect(vueSrc).toContain(
      `data-v-inspector="${rel(path.join(root, 'part.md'))}:1:1"`
    )
  })

  test('hand-built wrappers re-emit the attribute', async () => {
    const { vueSrc, file } = await renderPage(
      {
        'index.md': '::: v-pre\nvp\n:::\n\n::: raw\nrw\n:::\n\n$$\nx^2\n$$\n'
      },
      { markdown: { math: true } }
    )
    const at = (line: number) => `data-v-inspector="${rel(file)}:${line}:1"`
    expect(vueSrc).toContain(`<div v-pre ${at(1)}>`)
    expect(vueSrc).toContain(`<div class="vp-raw" ${at(5)}>`)
    expect(vueSrc).toContain(`tabindex="0" ${at(9)}`)
  })

  test('a custom highlight fallback does not double-stamp fences', async () => {
    const { vueSrc, file } = await renderPage(
      { 'index.md': '```ts\ncode\n```\n' },
      { markdown: { highlight: (code: string) => code } }
    )
    const occurrences = vueSrc.match(/data-v-inspector="[^"]*:1:1"/g)
    expect(occurrences).toHaveLength(1)
    // and it sits on the wrapper, not the inner code element
    expect(vueSrc).toContain(
      `<div class="language-ts" data-v-inspector="${rel(file)}:1:1">`
    )
  })

  test('alert body paragraphs point past the removed marker line', async () => {
    const { vueSrc, file } = await renderPage({
      'index.md': 'intro\n\n> [!WARNING]\n> line A\n>\n> line B\n'
    })
    const at = (line: number) => `data-v-inspector="${rel(file)}:${line}:1"`
    // the alert wrapper spans from the marker; its first paragraph does not
    expect(vueSrc).toContain(`github-alert" ${at(3)}`)
    expect(vueSrc).toContain(`<p ${at(4)}>line A</p>`)
    expect(vueSrc).toContain(`<p ${at(6)}>line B</p>`)
  })

  test('excerpt renders stay free of source attributes', async () => {
    disposeMdItInstance()
    const { createMarkdownRenderer } = await import('node/markdown/markdown')
    const md = await createMarkdownRenderer('.', {
      highlight: (code) => code,
      frontmatter: { grayMatterOptions: { excerpt: true } }
    })
    const env = {
      path: '/docs/page.md',
      relativePath: 'page.md',
      cleanUrls: false,
      emitSourceLoc: true
    } as any
    await md.renderAsync('---\nt: 1\n---\nfirst para\n\n---\n\nrest\n', env)
    expect(env.excerpt).toContain('first para')
    expect(env.excerpt).not.toContain('data-v-inspector')
  })

  test('builds render without source attributes', async () => {
    const { vueSrc } = await renderPage(
      { 'index.md': '# Head\n\npara\n' },
      { dev: false }
    )
    expect(vueSrc).not.toContain('data-v-inspector')
  })

  test('markdown.sourceAttrs: false keeps the dev DOM clean', async () => {
    const { vueSrc } = await renderPage(
      { 'index.md': '# Head\n\npara\n' },
      { markdown: { sourceAttrs: false } }
    )
    expect(vueSrc).not.toContain('data-v-inspector')
  })
})
