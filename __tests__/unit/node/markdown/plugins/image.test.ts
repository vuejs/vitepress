import { MarkdownItAsync } from 'markdown-it-async'
import { imagePlugin } from 'node/markdown/plugins/image'

describe('node/markdown/plugins/image', () => {
  const md = new MarkdownItAsync()
  imagePlugin(md as any)

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

  test('adds loading="lazy" attribute when lazyLoading is enabled', async () => {
    const mdLazy = new MarkdownItAsync()
    imagePlugin(mdLazy as any, { lazyLoading: true })
    const html = await mdLazy.renderAsync('![logo](foo.png)')
    expect(html).toContain('loading="lazy"')
  })
})
