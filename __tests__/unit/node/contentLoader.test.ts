import { mkdir, mkdtemp, rm, stat, utimes, writeFile } from 'node:fs/promises'
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

  test('excludes drafts with a string globOptions.ignore pattern', async () => {
    await setup(false)
    await mkdir(path.join(root!, 'drafts'))
    await writeFile(path.join(root!, 'drafts/post.md'), '# Unpublished')

    const data = await createContentLoader('**/*.md', {
      globOptions: { cwd: root, ignore: 'drafts/**' }
    }).load()

    expect(data.map((page) => page.url)).toEqual(['/', '/other.html'])
  })

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

  test.each([
    ['nested include', '<!-- @include: ./partial.md -->'],
    ['code snippet', '<<< ./included.txt']
  ])(
    'refreshes cached HTML and excerpts after a %s changes',
    async (_, src) => {
      await setup(false)
      const included = path.join(root!, 'included.txt')
      await writeFile(included, 'Before the edit')
      await writeFile(
        path.join(root!, 'partial.md'),
        '<!-- @include: ./included.txt -->'
      )
      await writeFile(path.join(root!, 'post.md'), `${src}\n\n---\n\nBody`)
      const loader = createContentLoader(['post.md', 'other.md'], {
        render: true,
        excerpt: true
      })
      const initial = await loader.load()
      const initialPost = initial.find((page) => page.url === '/post.html')!
      const initialOther = initial.find((page) => page.url === '/other.html')!
      expect(initialPost.html).toContain('Before the edit')
      expect(initialPost.excerpt).toContain('Before the edit')

      const unchanged = await loader.load()
      expect(unchanged.find((page) => page.url === '/post.html')).toBe(
        initialPost
      )

      // Change only the dependency, keeping the page's source and mtime intact.
      const timestamp = (await stat(included)).mtimeMs + 1000
      await writeFile(included, 'After the edit')
      await utimes(included, timestamp / 1000, timestamp / 1000)

      const updated = await loader.load()
      const updatedPost = updated.find((page) => page.url === '/post.html')!
      expect(updatedPost.html).toContain('After the edit')
      expect(updatedPost.excerpt).toContain('After the edit')
      expect(updatedPost.html).not.toContain('Before the edit')
      expect(updated.find((page) => page.url === '/other.html')).toBe(
        initialOther
      )
    }
  )

  test('tracks dependencies rendered only by a custom excerpt', async () => {
    await setup(false)
    const included = path.join(root!, 'included.txt')
    await writeFile(included, 'Before the edit')
    const loader = createContentLoader('index.md', {
      excerpt(file) {
        file.excerpt = '<!-- @include: ./included.txt -->'
      }
    })
    const initial = await loader.load()
    expect(initial[0].html).toBeUndefined()
    expect(initial[0].excerpt).toContain('Before the edit')

    const timestamp = (await stat(included)).mtimeMs + 1000
    await writeFile(included, 'After the edit')
    await utimes(included, timestamp / 1000, timestamp / 1000)

    expect((await loader.load())[0].excerpt).toContain('After the edit')
  })

  test('reports deleted dependencies instead of returning cached HTML', async () => {
    await setup(false)
    await writeFile(
      path.join(root!, 'post.md'),
      '<!-- @include: ./other.md -->'
    )
    const loader = createContentLoader('post.md', { render: true })
    expect((await loader.load())[0].html).toContain('Other')

    await rm(path.join(root!, 'other.md'))

    await expect(loader.load()).rejects.toThrow('Include file not found:')
  })

  test('refreshes silent includes when a missing file is created or deleted', async () => {
    await setup(false)
    const config = (global as any).VITEPRESS_CONFIG
    config.markdown = { include: { silent: true } }
    config.logger.warn = vi.fn()
    await writeFile(
      path.join(root!, 'post.md'),
      '<!-- @include: ./missing.md -->'
    )
    const loader = createContentLoader('post.md', { render: true })
    expect((await loader.load())[0].html).not.toContain('Created content')

    const included = path.join(root!, 'missing.md')
    await writeFile(included, 'Created content')
    expect((await loader.load())[0].html).toContain('Created content')

    await rm(included)
    expect((await loader.load())[0].html).not.toContain('Created content')
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
