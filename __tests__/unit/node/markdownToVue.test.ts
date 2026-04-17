import { describe, expect, test } from 'vitest'
import { createMarkdownToVueRenderFn } from '../../../src/node/markdownToVue'
import type { SiteConfig } from '../../../src/node/siteConfig'

describe('markdownToVue', () => {
  test('marks generated markdown default export as vapor when vue.features.vapor is enabled', async () => {
    const render = await createRenderFn()

    const { vueSrc } = await render('# Hello', `${process.cwd()}/index.md`, '')

    expect(vueSrc).toMatchInlineSnapshot(`
      "<script >
      export const __pageData = JSON.parse("{\\"title\\":\\"Hello\\",\\"description\\":\\"\\",\\"frontmatter\\":{},\\"headers\\":[],\\"relativePath\\":\\"index.md\\",\\"filePath\\":\\"index.md\\"}")
      export default {name:"index.md",__vapor:true}</script>
      <template><div><h1 id="hello" tabindex="-1">Hello <a class="header-anchor" href="#hello" aria-label="Permalink to “Hello”">&#8203;</a></h1>
      </div></template>"
    `)
  })

  test('keeps existing markdown script setup when marking default export as vapor', async () => {
    const render = await createRenderFn()

    const { vueSrc } = await render(
      `<script setup lang="ts">
const label: string = 'Hello'
</script>

# {{ label }}`,
      `${process.cwd()}/guide/index.md`,
      ''
    )

    expect(vueSrc).toMatchInlineSnapshot(`
      "<script lang="ts">
      export const __pageData = JSON.parse("{\\"title\\":\\"{{ label }}\\",\\"description\\":\\"\\",\\"frontmatter\\":{},\\"headers\\":[],\\"relativePath\\":\\"guide/index.md\\",\\"filePath\\":\\"guide/index.md\\"}")
      export default {name:"guide/index.md",__vapor:true}</script>
      <script setup lang="ts">
      const label: string = 'Hello'
      </script>
      <template><div><h1 id="label" tabindex="-1">{{ label }} <a class="header-anchor" href="#label" aria-label="Permalink to “{{ label }}”">&#8203;</a></h1>
      </div></template>"
    `)
  })
})

function createRenderFn() {
  return createMarkdownToVueRenderFn(
    process.cwd(),
    { cache: false },
    '/',
    false,
    false,
    createSiteConfig()
  )
}

function createSiteConfig(): SiteConfig {
  return {
    __dirty: true,
    pages: [],
    dynamicRoutes: [],
    rewrites: { map: {}, inv: {} },
    site: {
      base: '/',
      lang: 'en-US',
      dir: 'ltr',
      title: '',
      description: '',
      head: [],
      appearance: true,
      themeConfig: {},
      scrollOffset: 0,
      locales: {},
      router: { prefetchLinks: true }
    },
    vue: { features: { vapor: true } },
    ignoreDeadLinks: true
  } as unknown as SiteConfig
}
