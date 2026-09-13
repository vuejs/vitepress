import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { resolveConfig } from 'node/config'
import { createContentLoader } from 'node/contentLoader'
import { disposeMdItInstance } from 'node/markdown/markdown'

describe('node/contentLoader', () => {
  let root: string | undefined

  beforeEach(() => {
    disposeMdItInstance()
  })

  afterEach(async () => {
    if (root) {
      await rm(root, { recursive: true, force: true })
      root = undefined
    }
    delete (global as any).VITEPRESS_CONFIG
  })

  async function setup(cleanUrls: boolean) {
    root = await mkdtemp(path.join(tmpdir(), 'vitepress-content-loader-'))
    await writeFile(
      path.join(root, 'index.md'),
      '# Home\n\n[link](./other.md)\n'
    )
    await writeFile(path.join(root, 'other.md'), '# Other\n')

    const siteConfig = await resolveConfig(root, 'build', 'production')
    siteConfig.cleanUrls = cleanUrls
    ;(global as any).VITEPRESS_CONFIG = siteConfig
  }

  test('rendered internal links get .html when cleanUrls is false', async () => {
    await setup(false)

    const data = await createContentLoader('index.md', {
      render: true
    }).load()

    expect(data[0].html).toContain('href="./other.html"')
  })

  test('rendered internal links are clean when cleanUrls is true', async () => {
    await setup(true)

    const data = await createContentLoader('index.md', {
      render: true
    }).load()

    expect(data[0].html).toContain('href="./other"')
    expect(data[0].html).not.toContain('./other.html')
  })

  test('excerpts resolve $frontmatter without render', async () => {
    await setup(false)
    const { writeFile } = await import('node:fs/promises')
    await writeFile(
      path.join(root!, 'post.md'),
      '---\ntitle: My Post\n---\n\nIntro says {{ $frontmatter.title }}.\n\n---\n\nBody.\n'
    )

    const data = await createContentLoader('post.md', {
      excerpt: true
    }).load()

    expect(data[0].excerpt).toContain('Intro says My Post.')
  })

  test.each([false, true])(
    'uses the rewritten locale for rendered content and excerpts (render: %s)',
    async (render) => {
      await setup(false)
      await mkdir(path.join(root!, '.vitepress'))
      await writeFile(
        path.join(root!, '.vitepress/config.mjs'),
        `export default {
          rewrites: { 'translated.md': 'fr/post.md' },
          locales: {
            root: { label: 'English', lang: 'en' },
            fr: {
              label: 'French', lang: 'fr',
              markdown: { container: { tipLabel: 'Conseil' } }
            }
          }
        }`
      )
      const content = '# Post\n\n::: tip\nSome advice.\n:::\n\n---\n\nBody.\n'
      await writeFile(path.join(root!, 'translated.md'), content)
      await writeFile(path.join(root!, 'original.md'), content)
      await mkdir(path.join(root!, 'fr'))
      await writeFile(path.join(root!, 'fr/native.md'), content)
      ;(global as any).VITEPRESS_CONFIG = await resolveConfig(
        root!,
        'build',
        'production'
      )

      const data = await createContentLoader(
        ['translated.md', 'original.md', 'fr/native.md'],
        { render, excerpt: true }
      ).load()
      const translated = data.find((page) => page.url === '/fr/post.html')!
      const native = data.find((page) => page.url === '/fr/native.html')!
      const original = data.find((page) => page.url === '/original.html')!

      expect(translated.excerpt).toContain('Conseil')
      expect(native.excerpt).toContain('Conseil')
      expect(original.excerpt).toContain('TIP')
      if (render) {
        expect(translated.html).toContain('Conseil')
        expect(native.html).toContain('Conseil')
        expect(original.html).toContain('TIP')
      }
    }
  )
})
