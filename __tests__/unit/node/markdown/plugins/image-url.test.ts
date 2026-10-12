import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

import {
  createMarkdownRenderer,
  disposeMdItInstance,
  type MarkdownRenderer
} from 'node/markdown/markdown'

describe('image dimensions with URL suffixes', () => {
  let root: string
  let md: MarkdownRenderer

  beforeAll(async () => {
    root = await mkdtemp(path.join(tmpdir(), 'vitepress-image-url-'))
    await mkdir(path.join(root, 'public'))
    for (const file of [
      'diagram.svg',
      'diagram space.svg',
      'diagram#hash.svg',
      'public/diagram.svg'
    ]) {
      await writeFile(
        path.join(root, file),
        '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80"><g id="layer"/></svg>'
      )
    }
    disposeMdItInstance()
    md = await createMarkdownRenderer(root, { highlight: (code) => code })
  })

  afterAll(async () => {
    disposeMdItInstance()
    await rm(root, { recursive: true, force: true })
  })

  describe.each([
    './diagram.svg',
    '/diagram.svg',
    './diagram%20space.svg',
    './diagram%23hash.svg'
  ])('%s', (pathname) => {
    test.each(['?v=1', '#layer', '?v=1#layer'])(
      'reads dimensions while preserving %s',
      async (suffix) => {
        const src = pathname + suffix
        const html = await md.renderAsync(`![Diagram](${src})`, {
          path: path.join(root, 'index.md')
        })

        expect(html).toContain(`src="${decodeURIComponent(src)}"`)
        expect(html).toContain('width="120"')
        expect(html).toContain('height="80"')
      }
    )
  })

  test.each([
    ['width=240', '240', '160'],
    ['height=40', '60', '40'],
    ['width=240 height=90', '240', '90']
  ])('respects explicit dimensions: %s', async (attrs, width, height) => {
    const html = await md.renderAsync(
      `![Diagram](/diagram.svg?v=1#layer){${attrs}}`,
      { path: path.join(root, 'index.md') }
    )

    expect(html).toContain('src="/diagram.svg?v=1#layer"')
    expect(html).toContain(`width="${width}"`)
    expect(html).toContain(`height="${height}"`)
  })
})
