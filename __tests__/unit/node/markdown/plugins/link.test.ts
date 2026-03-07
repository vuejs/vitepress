import { MarkdownItAsync } from 'markdown-it-async'
import { describe, expect, test } from 'vitest'
import { linkPlugin } from '../../../../../src/node/markdown/plugins/link'

describe('node/markdown/plugins/link', () => {
  const slugify = (str: string) => str.toLowerCase().replace(/\s+/g, '-')

  test('preserves text-fragment hashes on markdown links', async () => {
    const md = new MarkdownItAsync()
    linkPlugin(md, {}, '/', slugify)

    const html = await md.renderAsync(
      '[58-61](/resources/server/user#:~:text=58*,time%20authentication%20token)',
      { cleanUrls: false }
    )

    expect(html).toContain(
      'href="/resources/server/user.html#:~:text=58*,time authentication token"'
    )
  })

  test('continues to normalize regular heading hashes', async () => {
    const md = new MarkdownItAsync()
    linkPlugin(md, {}, '/', slugify)

    const html = await md.renderAsync(
      '[Section](/guide/getting-started#Hello%20World)',
      {
        cleanUrls: false
      }
    )

    expect(html).toContain('href="/guide/getting-started.html#hello-world"')
  })
})
