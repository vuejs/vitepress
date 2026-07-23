import { resolveConfig } from 'node/config'
import { createContentLoader } from 'node/contentLoader'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

describe('node/contentLoader', () => {
  let root: string | undefined

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
})
