import { slugify } from '@mdit-vue/shared'
import { MarkdownItAsync } from 'markdown-it-async'
import { linkPlugin } from 'node/markdown/plugins/link'

describe('node/markdown/plugins/link', () => {
  const md = new MarkdownItAsync()
  linkPlugin(md, {}, '/', slugify)

  test('preserves text-fragment hashes on markdown links', async () => {
    const html = await md.renderAsync(
      '[58-61](/resources/server/user#:~:text=58*,time%20authentication%20token)',
      { cleanUrls: false }
    )

    expect(html).toContain(
      'href="/resources/server/user.html#:~:text=58*,time%20authentication%20token"'
    )
  })

  // https://web.dev/articles/text-fragments#mixing_element_and_text_fragments
  test('preserves mixed element and text-fragment hashes', async () => {
    const html = await md.renderAsync(
      '[Section](/guide/getting-started#Hello%20World:~:text=Hello%20World)',
      { cleanUrls: false }
    )

    expect(html).toContain(
      'href="/guide/getting-started.html#hello-world:~:text=Hello%20World"'
    )
  })

  test('continues to normalize regular heading hashes', async () => {
    const html = await md.renderAsync(
      '[Section](/guide/getting-started#Hello%20World)',
      { cleanUrls: false }
    )

    expect(html).toContain('href="/guide/getting-started.html#hello-world"')
  })
})
