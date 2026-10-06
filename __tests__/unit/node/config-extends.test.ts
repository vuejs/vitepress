import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { resolveUserConfig } from 'node/config'

describe('node/config additional config discovery with extends', () => {
  let root: string

  beforeEach(async () => {
    root = await mkdtemp(path.join(tmpdir(), 'vitepress-config-extends-'))
  })

  afterEach(async () => {
    await rm(root, { recursive: true, force: true })
  })

  async function write(file: string, content: string) {
    const fullPath = path.join(root, file)
    await mkdir(path.dirname(fullPath), { recursive: true })
    await writeFile(fullPath, content)
  }

  test.each([
    "{ extends: { srcDir: 'content' } }",
    `{
      extends: async () => ({ extends: Promise.resolve({ srcDir: 'base' }) }),
      srcDir: 'content'
    }`
  ])(
    'discovers directory configs using the resolved srcDir: %s',
    async (source) => {
      await write('.vitepress/config.mjs', `export default ${source}`)
      await write('content/fr/config.mjs', "export default { title: 'French' }")

      const [config, , deps] = await resolveUserConfig(
        root,
        'build',
        'production'
      )

      expect(config.srcDir).toBe('content')
      expect(config.additionalConfig).toEqual({ '/fr/': { title: 'French' } })
      expect(deps).toContain(
        path.join(root, 'content/fr/config.mjs').replaceAll('\\', '/')
      )
    }
  )

  test('applies inherited srcExclude before loading directory configs', async () => {
    await write(
      '.vitepress/config.mjs',
      "export default { extends: { srcExclude: ['drafts/**'] } }"
    )
    await write('fr/config.mjs', "export default { title: 'French' }")
    await write('drafts/config.mjs', "export default { title: 'Draft' }")

    const [config, , deps] = await resolveUserConfig(
      root,
      'build',
      'production'
    )

    expect(config.additionalConfig).toEqual({ '/fr/': { title: 'French' } })
    expect(deps).not.toContain(
      path.join(root, 'drafts/config.mjs').replaceAll('\\', '/')
    )
  })

  test.each([
    '{}',
    "{ '/manual/': { title: 'Manual' } }",
    "() => [{ title: 'Manual' }]"
  ])(
    'preserves inherited additionalConfig %s without auto-loading',
    async (additionalConfig) => {
      await write(
        '.vitepress/config.mjs',
        `export default { extends: { additionalConfig: ${additionalConfig} } }`
      )
      await write('fr/config.mjs', "export default { title: 'Auto-loaded' }")

      const [config, , deps] = await resolveUserConfig(
        root,
        'build',
        'production'
      )

      if (additionalConfig.startsWith('()')) {
        expect(config.additionalConfig).toBeTypeOf('function')
      } else if (additionalConfig === '{}') {
        expect(config.additionalConfig).toEqual({})
      } else {
        expect(config.additionalConfig).toEqual({
          '/manual/': { title: 'Manual' }
        })
      }
      expect(deps).not.toContain(
        path.join(root, 'fr/config.mjs').replaceAll('\\', '/')
      )
    }
  )
})
