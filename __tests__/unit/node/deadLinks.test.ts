import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { resolveConfig } from 'node/config'
import { findSidebarDeadLinks } from 'node/deadLinks'

describe('node/deadLinks', () => {
  let root: string | undefined

  afterEach(async () => {
    if (root) {
      await rm(root, { recursive: true, force: true })
      root = undefined
    }
  })

  test('reports dead links from sidebar config', async () => {
    root = await mkdtemp(path.join(tmpdir(), 'vitepress-sidebar-dead-link-'))

    await writeFile(path.join(root, 'index.md'), '# Home\n')
    await mkdir(path.join(root, '.vitepress'))
    await writeFile(
      path.join(root, '.vitepress', 'config.ts'),
      `export default {
        themeConfig: {
          sidebar: [
            {
              text: 'Guide',
              items: [
                { text: 'Intro', link: '/' },
                { text: 'Missing', link: '/missing' }
              ]
            }
          ]
        }
      }`
    )

    const siteConfig = await resolveConfig(root, 'build', 'production')

    expect(findSidebarDeadLinks(siteConfig, 'public')).toContainEqual({
      url: '/missing',
      file: siteConfig.configPath!
    })
  })
})
