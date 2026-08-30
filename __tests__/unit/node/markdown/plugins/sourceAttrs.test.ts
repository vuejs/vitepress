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
