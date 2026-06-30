import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { resolveConfig } from 'node/config'
import { createContentLoader } from 'node/contentLoader'

describe('node/contentLoader', () => {
  let root: string | undefined
  let previousConfig: unknown

  beforeEach(() => {
    previousConfig = (globalThis as any).VITEPRESS_CONFIG
  })

  afterEach(async () => {
    if (root) {
      await rm(root, { recursive: true, force: true })
      root = undefined
    }
    ;(globalThis as any).VITEPRESS_CONFIG = previousConfig
  })

  test('renders markdown links with cleanUrls in content and excerpts', async () => {
    root = await mkdtemp(path.join(tmpdir(), 'vitepress-content-loader-'))

    await mkdir(path.join(root, '.vitepress'), { recursive: true })
    await mkdir(path.join(root, 'posts'), { recursive: true })
    await writeFile(
      path.join(root, '.vitepress', 'config.ts'),
      'export default { cleanUrls: true }\n'
    )
    await writeFile(path.join(root, 'posts', 'guide.md'), '# Guide\n')
    await writeFile(
      path.join(root, 'posts', 'one.md'),
      [
        '---',
        'title: One',
        '---',
        '',
        '[Guide excerpt](./guide.md)',
        '',
        '---',
        '',
        '[Guide body](./guide.md)',
        ''
      ].join('\n')
    )

    await resolveConfig(root, 'build', 'production')

    const loader = createContentLoader('posts/one.md', {
      render: true,
      excerpt: true
    })
    const [data] = await loader.load()

    expect(data.url).toBe('/posts/one')
    expect(data.html).toContain('href="./guide"')
    expect(data.html).not.toContain('./guide.html')
    expect(data.excerpt).toContain('href="./guide"')
    expect(data.excerpt).not.toContain('./guide.html')
  })
})
