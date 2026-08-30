import { slugify } from '@mdit-vue/shared'
import { MarkdownItAsync } from 'markdown-it-async'
import { linkPlugin } from 'node/markdown/plugins/link'
import type { MarkdownLink } from 'node/shared'

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

  test('does not break encoding for text-fragments', async () => {
    const html = await md.renderAsync(
      '[Section](/foo?title=Cat&oldid=916388819#:~:text=Claws-,Like%20almost,the%20Felidae%2C,-cats)',
      { cleanUrls: false }
    )

    expect(html).toContain(
      'href="/foo.html?title=Cat&amp;oldid=916388819#:~:text=Claws-,Like%20almost,the%20Felidae%2C,-cats"'
    )
  })

  test('collects links with their destination as authored', async () => {
    const env: { cleanUrls: boolean; links?: MarkdownLink[] } = {
      cleanUrls: false
    }

    await md.renderAsync('Intro\n\n[Missing](./missing.md)\n', env)

    expect(env.links).toEqual([{ url: './missing.html', raw: './missing.md' }])
  })
})

describe('node/markdown/plugins/link with a relative base', () => {
  const md = new MarkdownItAsync()
  linkPlugin(md, {}, './', slugify)
  const render = (src: string, env: object = {}) =>
    md.renderAsync(src, {
      cleanUrls: false,
      relativePath: 'guide/page.md',
      relativizeUrls: true,
      ...env
    })

  test('site-absolute links become page-relative', async () => {
    expect(await render('[x](/other/thing)')).toContain(
      'href="../other/thing.html"'
    )
    expect(
      await render('[x](/other/thing)', { relativePath: 'index.md' })
    ).toContain('href="./other/thing.html"')
    expect(
      await render('[x](/other/thing)', { relativePath: 'a/b/c.md' })
    ).toContain('href="../../other/thing.html"')
  })

  test('directory links point at index.html', async () => {
    expect(await render('[home](/)')).toContain('href="../index.html"')
    expect(await render('[dir](/guide/)')).toContain(
      'href="../guide/index.html"'
    )
  })

  test('non-page files get the prefix but no .html', async () => {
    expect(await render('[zip](/file.zip)')).toContain('href="../file.zip"')
  })

  test('hash, external and relative links stay untouched', async () => {
    expect(await render('[a](#section)')).toContain('href="#section"')
    expect(await render('[a](https://example.com/x)')).toContain(
      'href="https://example.com/x"'
    )
    expect(await render('[a](./sibling)')).toContain('href="./sibling.html"')
  })

  test('cleanUrls drops .html and the index suffix', async () => {
    expect(await render('[x](/other/thing)', { cleanUrls: true })).toContain(
      'href="../other/thing"'
    )
    expect(await render('[dir](/guide/)', { cleanUrls: true })).toContain(
      'href="../guide/"'
    )
  })

  test('content-loader renders keep absolute links site-absolute', async () => {
    // content loaders set relativePath but not relativizeUrls — their html
    // is embedded in other pages, so the source's depth must not apply
    expect(
      await render('[x](/other/thing)', { relativizeUrls: undefined })
    ).toContain('href="/other/thing.html"')
    expect(
      await render('[x](/other/thing)', { relativePath: undefined })
    ).toContain('href="/other/thing.html"')
  })
})

describe('node/markdown/plugins/link with an absolute base', () => {
  const md = new MarkdownItAsync()
  linkPlugin(md, {}, '/docs/', slugify)

  test('site-absolute links get the base and keep one slash', async () => {
    const html = await md.renderAsync('[x](/guide/what)', {
      cleanUrls: false,
      relativePath: 'index.md'
    })
    expect(html).toContain('href="/docs/guide/what.html"')
  })
})
