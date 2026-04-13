import { describe, expect, test } from 'vitest'
import { createMarkdownToVueRenderFn } from '../../../src/node/markdownToVue'
import type { SiteConfig } from '../../../src/node/siteConfig'

describe('markdownToVue', () => {
  test('uses script setup for generated markdown page options in vapor mode', async () => {
    const render = await createMarkdownToVueRenderFn(
      process.cwd(),
      { cache: false },
      '/',
      false,
      false,
      createSiteConfig(true)
    )

    const { vueSrc } = await render('# Hello', `${process.cwd()}/index.md`, '')

    expect(vueSrc).toMatchInlineSnapshot(`
      "<script >
      export const __pageData = JSON.parse("{\\"title\\":\\"Hello\\",\\"description\\":\\"\\",\\"frontmatter\\":{},\\"headers\\":[],\\"relativePath\\":\\"index.md\\",\\"filePath\\":\\"index.md\\"}")</script>
      <script setup vapor>
      defineOptions({ name: "index.md" })
      </script>
      <template><div><h1 id="hello" tabindex="-1">Hello <a class="header-anchor" href="#hello" aria-label="Permalink to “Hello”">&#8203;</a></h1>
      </div></template>"
    `)
  })

  test('marks existing markdown script setup as vapor', async () => {
    const render = await createMarkdownToVueRenderFn(
      process.cwd(),
      { cache: false },
      '/',
      false,
      false,
      createSiteConfig(true)
    )

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
      export const __pageData = JSON.parse("{\\"title\\":\\"{{ label }}\\",\\"description\\":\\"\\",\\"frontmatter\\":{},\\"headers\\":[],\\"relativePath\\":\\"guide/index.md\\",\\"filePath\\":\\"guide/index.md\\"}")</script>
      <script setup lang="ts" vapor>
      const label: string = 'Hello'

      defineOptions({ name: "guide/index.md" })
      </script>
      <template><div><h1 id="label" tabindex="-1">{{ label }} <a class="header-anchor" href="#label" aria-label="Permalink to “{{ label }}”">&#8203;</a></h1>
      </div></template>"
    `)
  })
})

function createSiteConfig(vapor: boolean): SiteConfig {
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
    vue: vapor ? { script: { vapor: true } } : undefined,
    ignoreDeadLinks: true
  } as unknown as SiteConfig
}
