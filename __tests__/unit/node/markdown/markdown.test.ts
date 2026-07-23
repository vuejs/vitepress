import { anchor as anchorPlugin } from '@mdit/plugin-anchor'
import attrsPlugin from 'markdown-it-attrs'
import { MarkdownItAsync } from 'markdown-it-async'
import {
  createMarkdownRenderer,
  disposeMdItInstance,
  type MarkdownOptions
} from 'node/markdown/markdown'

async function render(src: string, options: MarkdownOptions = {}) {
  disposeMdItInstance()
  const md = await createMarkdownRenderer('.', {
    highlight: (code) => code,
    ...options
  })
  return md.renderAsync(src)
}

describe('node/markdown/markdown', () => {
  describe('disabling built-in plugins', () => {
    test('anchor', async () => {
      const enabled = await render('# Hello World')
      expect(enabled).toContain('id="hello-world"')
      expect(enabled).toContain('header-anchor')

      const disabled = await render('# Hello World', { anchor: false })
      expect(disabled).not.toContain('id=')
      expect(disabled).not.toContain('header-anchor')
    })

    test('attrs', async () => {
      const enabled = await render('## Title {#custom-id}')
      expect(enabled).toContain('id="custom-id"')

      const disabled = await render('## Title {#custom-id}', { attrs: false })
      expect(disabled).not.toContain('id="custom-id"')
      expect(disabled).toContain('{#custom-id}')
    })

    test('emoji', async () => {
      expect(await render(':tada:')).toContain('🎉')
      expect(await render(':tada:', { emoji: false })).toContain(':tada:')
    })

    test('toc', async () => {
      const src = '# Title\n\n[[toc]]'
      expect(await render(src)).toContain('table-of-contents')

      const disabled = await render(src, { toc: false })
      expect(disabled).not.toContain('table-of-contents')
      expect(disabled).toContain('[[toc]]')
    })

    test('preWrapper', async () => {
      const src = '```js\nconst a = 1\n```'
      const enabled = await render(src)
      expect(enabled).toContain('<div class="language-js">')
      expect(enabled).toContain('class="copy"')

      const disabled = await render(src, { preWrapper: false })
      expect(disabled).not.toContain('<div class="language-js">')
      expect(disabled).not.toContain('class="copy"')
    })

    test('preWrapper disables line numbers with it', async () => {
      const src = '```js\nconst a = 1\n```'
      const enabled = await render(src, { lineNumbers: true })
      expect(enabled).toContain('line-numbers-wrapper')

      const disabled = await render(src, {
        preWrapper: false,
        lineNumbers: true
      })
      expect(disabled).not.toContain('line-numbers-wrapper')
    })

    test('snippet', async () => {
      const disabled = await render('<<< ./foo.js', { snippet: false })
      expect(disabled).toContain('&lt;&lt;&lt; ./foo.js')
    })

    test('image', async () => {
      const src = '![img](/foo.png)'
      const enabled = await render(src, { image: { lazyLoad: true } })
      expect(enabled).toContain('loading="lazy"')

      const disabled = await render(src, { image: false })
      expect(disabled).not.toContain('loading="lazy"')
    })

    test('component', async () => {
      const src = 'text\n<MyComponent/>\nmore'
      const enabled = await render(src)
      expect(enabled).toContain('</p>\n<MyComponent/><p>')

      const disabled = await render(src, { component: false })
      expect(disabled).toContain('<p>text\n<MyComponent/>\nmore</p>')
    })

    test('tableTabIndex', async () => {
      const src = '| a |\n| --- |\n| b |'
      expect(await render(src)).toContain('tabindex="0"')
      expect(await render(src, { tableTabIndex: false })).not.toContain(
        'tabindex'
      )
    })

    test('cjkFriendlyEmphasis', async () => {
      const src = 'これは**「テスト」**です'
      expect(await render(src)).toContain('<strong>「テスト」</strong>')
      expect(await render(src, { cjkFriendlyEmphasis: false })).not.toContain(
        '<strong>'
      )
    })
  })

  // attrs applies at a fixed position in the core chain (before linkify),
  // while anchor pushes to its end, so anchor always sees user-defined ids
  // no matter which plugin is registered first
  test('anchor respects ids from attrs regardless of plugin order', async () => {
    for (const plugins of [
      [attrsPlugin, anchorPlugin],
      [anchorPlugin, attrsPlugin]
    ] as const) {
      const md = new MarkdownItAsync()
      for (const plugin of plugins) md.use(plugin)
      expect(await md.renderAsync('## Title {#custom-id}')).toContain(
        'id="custom-id"'
      )
    }
  })
})
