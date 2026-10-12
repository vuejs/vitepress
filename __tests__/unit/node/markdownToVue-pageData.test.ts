import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { resolveConfig } from 'node/config'
import { disposeMdItInstance } from 'node/markdown/markdown'
import { createMarkdownToVueRenderFn } from 'node/markdownToVue'
import { compileScript, parse } from 'vue/compiler-sfc'

describe('page data script serialization', () => {
  let root: string
  let file: string
  let render: Awaited<ReturnType<typeof createMarkdownToVueRenderFn>>

  beforeAll(async () => {
    root = await mkdtemp(path.join(tmpdir(), 'vitepress-page-data-'))
    file = path.join(root, 'index.md')
    await writeFile(file, '# Page\n')
    const siteConfig = await resolveConfig(root, 'build', 'production')
    disposeMdItInstance()
    render = await createMarkdownToVueRenderFn(
      root,
      { cache: false },
      '/',
      false,
      false,
      siteConfig
    )
  })

  afterAll(async () => {
    disposeMdItInstance()
    await rm(root, { recursive: true, force: true })
  })

  describe.each([
    ['no script', ''],
    ['named export', '<script>\nexport const custom = true\n</script>'],
    [
      'default export',
      '<script>\nexport default { name: "Custom" }\n</script>'
    ],
    ['script setup', '<script setup>\nconst custom = true\n</script>']
  ])('%s', (_, script) => {
    test.each([
      'Document </script> tags literally',
      "Regular-expression substitutions: $&, $`, $' and $$"
    ])('preserves %j', async (description) => {
      const src = [
        '---',
        `description: ${JSON.stringify(description)}`,
        '---',
        '',
        '# Page',
        '',
        script
      ].join('\n')

      const result = await render(src, file)
      const { descriptor, errors } = parse(result.vueSrc, { filename: file })

      expect(errors).toEqual([])
      expect(() => compileScript(descriptor, { id: 'page-data' })).not.toThrow()
      const module = await import(
        'data:text/javascript;base64,' +
          Buffer.from(descriptor.script!.content).toString('base64')
      )
      expect(module.__pageData).toEqual(result.pageData)
      expect(module.__pageData.description).toBe(description)
      expect(module.__pageData.frontmatter.description).toBe(description)
    })
  })
})
