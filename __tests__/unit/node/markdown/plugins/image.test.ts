import path from 'node:path'
import { MarkdownItAsync } from 'markdown-it-async'
import attrsPlugin from 'markdown-it-attrs'
import { imagePlugin, type Options } from 'node/markdown/plugins/image'

const srcDir = path.resolve(import.meta.dirname, '../../../../e2e')
const publicDir = path.join(srcDir, 'public')
const env = { path: path.join(srcDir, 'index.md') }

function createRenderer(options?: Options) {
  const md = new MarkdownItAsync()

  // same registration order as createMarkdownRenderer
  imagePlugin(md, publicDir, options)
  attrsPlugin(md as any)

  return md
}

describe('node/markdown/plugins/image', () => {
  const md = createRenderer()

  describe('src normalization', () => {
    test('default image output', async () => {
      const html = await md.renderAsync('![logo](foo.png)')

      expect(html.trim()).toMatchInlineSnapshot(
        `"<p><img src="./foo.png" alt="logo"></p>"`
      )
    })

    test.for([
      ['foo.png', './foo.png'],
      ['./foo.png', './foo.png'],
      ['../foo.png', '../foo.png'],
      ['../../foo.png', '../../foo.png'],
      ['/foo.png', '/foo.png'],
      ['https://example.com/foo.png', 'https://example.com/foo.png']
    ])('normalizes image src: %s → %s', async ([src, expected]) => {
      const html = await md.renderAsync(`![logo](${src})`)

      expect(html).toContain(`src="${expected}"`)
    })
  })

  describe('dimensions', () => {
    test('adds width and height from local image dimensions', async () => {
      const html = await md.renderAsync('![logo](./assets/vitepress.png)', env)

      expect(html).toContain('width="48"')
      expect(html).toContain('height="48"')
    })

    test('adds width and height from public image dimensions', async () => {
      const html = await md.renderAsync('![logo](/vitepress.png)', env)

      expect(html).toContain('width="48"')
      expect(html).toContain('height="48"')
    })

    test('adds width and height when the image url is encoded', async () => {
      const html = await md.renderAsync(
        '![logo](./assets/vitepress%20logo.png)',
        env
      )

      expect(html).toContain('src="./assets/vitepress logo.png"')
      expect(html).toContain('width="48"')
      expect(html).toContain('height="48"')
    })

    test('does not override explicit width and height', async () => {
      const html = await md.renderAsync(
        '![logo](/vitepress.png){width=100 height=200}',
        env
      )

      expect(html).toContain('width="100"')
      expect(html).toContain('height="200"')
    })

    test('scales height proportionally when only width is set', async () => {
      const html = await md.renderAsync(
        '![logo](/vitepress.png){width=96}',
        env
      )

      // 48x48 image scaled to width=96 → height=96
      expect(html).toContain('width="96"')
      expect(html).toContain('height="96"')
    })

    test('scales width proportionally when only height is set', async () => {
      const html = await md.renderAsync(
        '![logo](/vitepress.png){height=24}',
        env
      )

      // 48x48 image scaled to height=24 → width=24
      expect(html).toContain('width="24"')
      expect(html).toContain('height="24"')
    })

    test('ignores non-numeric width when scaling', async () => {
      const html = await md.renderAsync(
        '![logo](/vitepress.png){width=50%}',
        env
      )

      expect(html).toContain('width="50%"')
      expect(html).not.toContain('height=')
    })

    test('does not add dimensions for external images', async () => {
      const html = await md.renderAsync(
        '![logo](https://example.com/image.png)',
        env
      )

      expect(html).not.toContain('width=')
      expect(html).not.toContain('height=')
    })
  })

  describe('lazy loading', () => {
    const mdLazy = createRenderer({ lazyLoad: true })

    test('adds loading="lazy" when lazy loading is enabled', async () => {
      const html = await mdLazy.renderAsync('![logo](foo.png)')

      expect(html).toContain('loading="lazy"')
    })

    test('does not override user-specified loading strategy', async () => {
      const html = await mdLazy.renderAsync('![logo](foo.png){loading=eager}')

      expect(html).toContain('loading="eager"')
      expect(html).not.toContain('loading="lazy"')
    })
  })
})
