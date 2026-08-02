import type { SiteConfig } from 'node/config'
import {
  createRenderMetadata,
  deserializeRenderMetadata,
  deserializeRenderedPage,
  serializeRenderMetadata,
  serializeRenderedPage
} from 'node/build/render'
import type { Rolldown } from 'vite'

const chunk = (values: Partial<Rolldown.OutputChunk>): Rolldown.OutputChunk =>
  ({
    type: 'chunk',
    fileName: '',
    name: '',
    code: '',
    imports: [],
    moduleIds: [],
    isEntry: false,
    ...values
  }) as Rolldown.OutputChunk

const asset = (fileName: string): Rolldown.OutputAsset =>
  ({
    type: 'asset',
    fileName,
    names: [],
    originalFileNames: [],
    source: ''
  }) as Rolldown.OutputAsset

test('retains only compact client metadata and round-trips maps', () => {
  const pagePath = '/site/guide.md'
  const clientResult = {
    output: [
      chunk({
        fileName: 'assets/app.123.js',
        facadeModuleId: '/vitepress/app/index.js',
        imports: ['assets/framework.js'],
        isEntry: true,
        code: 'large app code that must not be retained'
      }),
      chunk({
        fileName: 'assets/guide.123.js',
        facadeModuleId: pagePath,
        imports: ['assets/theme.js'],
        isEntry: true,
        code: 'large page code that must not be retained'
      }),
      chunk({
        name: 'theme',
        moduleIds: ['/vitepress/client/theme-default/index.js']
      }),
      asset('assets/style.123.css'),
      asset('assets/logo.123.svg')
    ]
  } as Rolldown.RolldownOutput
  const config = {
    mpa: false,
    site: { base: '/docs/' }
  } as SiteConfig

  const metadata = createRenderMetadata(config, clientResult, null)
  const serialized = serializeRenderMetadata(metadata)
  const restored = deserializeRenderMetadata(serialized)

  expect(restored.appChunk).toEqual({
    fileName: 'assets/app.123.js',
    imports: ['assets/framework.js']
  })
  expect(restored.cssChunk).toEqual({ fileName: 'assets/style.123.css' })
  expect(restored.assets).toEqual(['/docs/assets/logo.123.svg'])
  expect(restored.isDefaultTheme).toBe(true)
  expect(restored.pageImports.get(pagePath)).toEqual(['assets/theme.js'])
  expect(JSON.stringify(serialized)).not.toContain('large page code')
  expect(JSON.stringify(serialized)).not.toContain('large app code')
})

test('retains inlineable page chunks for normal MPA rendering', () => {
  const pagePath = '/site/index.md'
  const clientResult = {
    output: [
      chunk({
        fileName: 'assets/index.js',
        facadeModuleId: pagePath,
        isEntry: true,
        code: 'console.log("client")'
      })
    ]
  } as Rolldown.RolldownOutput
  const serverResult = {
    output: [asset('assets/mpa.css')]
  } as Rolldown.RolldownOutput
  const config = { mpa: true, site: { base: '/' } } as SiteConfig

  const metadata = createRenderMetadata(config, clientResult, serverResult)

  expect(metadata.pageChunks.get(pagePath)).toEqual({
    fileName: 'assets/index.js',
    code: 'console.log("client")'
  })
  expect(metadata.cssChunk).toEqual({ fileName: 'assets/mpa.css' })
})

test('round-trips worker render results with sorted Set-backed state', () => {
  const renderedPage = {
    page: 'guide.md',
    pageData: {
      title: 'Guide',
      description: '',
      frontmatter: {},
      headers: [],
      relativePath: 'guide.md',
      filePath: 'guide.md'
    },
    hasCustom404: true,
    context: {
      content: '<main>Guide</main>',
      teleports: { body: '<div>teleported</div>' },
      vpSocialIcons: new Set(['z-icon', 'a-icon'])
    }
  }

  const serialized = serializeRenderedPage(renderedPage)
  expect(serialized.context.vpSocialIcons).toEqual(['a-icon', 'z-icon'])

  const restored = deserializeRenderedPage(serialized)
  expect(restored).toMatchObject({
    page: renderedPage.page,
    pageData: renderedPage.pageData,
    hasCustom404: true,
    context: {
      content: '<main>Guide</main>',
      teleports: { body: '<div>teleported</div>' }
    }
  })
  expect(restored.context.vpSocialIcons).toBeInstanceOf(Set)
  expect([...restored.context.vpSocialIcons]).toEqual(['a-icon', 'z-icon'])
})
