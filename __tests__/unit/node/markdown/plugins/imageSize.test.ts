import path from 'node:path'
import { MarkdownItAsync } from 'markdown-it-async'
import attrsPlugin from 'markdown-it-attrs'
import { imageSizePlugin } from 'node/markdown/plugins/imageSize'

const srcDir = path.resolve(import.meta.dirname, '../../../../e2e')
const env = { path: path.join(srcDir, 'index.md') }

describe('node/markdown/plugins/imageSize', () => {
  const md = new MarkdownItAsync()
  attrsPlugin(md as any)
  imageSizePlugin(md, srcDir)

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

  test('does not override explicit width and height', async () => {
    const html = await md.renderAsync(
      '![logo](/vitepress.png){width=100 height=200}',
      env
    )

    expect(html).toContain('width="100"')
    expect(html).toContain('height="200"')
  })

  test('scales height proportionally when only width is set', async () => {
    const html = await md.renderAsync('![logo](/vitepress.png){width=96}', env)

    // 48x48 image scaled to width=96 → height=96
    expect(html).toContain('width="96"')
    expect(html).toContain('height="96"')
  })

  test('scales width proportionally when only height is set', async () => {
    const html = await md.renderAsync('![logo](/vitepress.png){height=24}', env)

    // 48x48 image scaled to height=24 → width=24
    expect(html).toContain('width="24"')
    expect(html).toContain('height="24"')
  })

  test('leaves external image src unchanged', async () => {
    const html = await md.renderAsync(
      '![logo](https://example.com/image.png)',
      env
    )

    expect(html).toContain('src="https://example.com/image.png"')
    expect(html).not.toContain('width=')
    expect(html).not.toContain('height=')
  })
})
