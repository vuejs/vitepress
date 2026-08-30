import {
  createMarkdownRenderer,
  disposeMdItInstance,
  type MarkdownOptions
} from 'node/markdown/markdown'
// the full build, for compiling templates the way the Vue plugin would
// @ts-expect-error no types for dist builds
import { createSSRApp } from 'vue/dist/vue.cjs.js'
import { renderToString } from 'vue/server-renderer'

async function createMd(options: MarkdownOptions = {}) {
  disposeMdItInstance()
  return createMarkdownRenderer('.', { highlight: (code) => code, ...options })
}

async function render(src: string, env: Record<string, any> = {}) {
  return (await createMd()).renderAsync(src, env)
}

const frontmatter = `\
---
title: Hello World
count: 5
flag: true
nothing: null
date: 2024-01-18
html: '<b>&amp; {{ hi }}</b>'
mustache: '{{ x }}'
k-y: dashed
spaced: 'a  b'
multiline: |
  line one
  line two
homepage: https://vitepress.dev/
nested:
  deep: value
list:
  - a
  - b
---

`

async function renderBody(body: string) {
  return (await render(frontmatter + body)).trim()
}

describe('node/markdown/plugins/frontmatterExpressions', () => {
  test('resolves property paths and escapes the value', async () => {
    const html = await render(`\
---
meta:
  title: A <b>& B
count: 2
done: false
---

{{ $frontmatter.meta.title }} / {{$frontmatter.count}} / {{ $frontmatter.done }}
`)
    expect(html).toContain('<p>A &lt;b&gt;&amp; B / 2 / false</p>')
  })

  test('resolves bracket paths and dates', async () => {
    expect(await renderBody("{{ $frontmatter['k-y'] }}")).toBe('<p>dashed</p>')
    expect(await renderBody('{{ $frontmatter["k-y"] }}')).toBe('<p>dashed</p>')
    expect(await renderBody('{{ $frontmatter.list[1] }}')).toBe('<p>b</p>')
    expect(await renderBody('{{ $frontmatter.list.length }}')).toBe('<p>2</p>')
    // dates are normalized the same way the `__pageData` JSON round-trip
    // normalizes them for the runtime
    expect(await renderBody('{{ $frontmatter.date }}')).toBe(
      '<p>2024-01-18T00:00:00.000Z</p>'
    )
  })

  test('escapes values so they render as this exact text', async () => {
    expect(await renderBody('{{ $frontmatter.html }}')).toBe(
      '<p>&lt;b&gt;&amp;amp; &#123;&#123; hi &#125;&#125;&lt;/b&gt;</p>'
    )
    // a value containing mustaches must not be interpolated again by Vue
    expect(await renderBody('{{ $frontmatter.mustache }}')).toBe(
      '<p>&#123;&#123; x &#125;&#125;</p>'
    )
    expect(
      await renderBody(
        '&copy; {{ $frontmatter.title }} / {{ $frontmatter.no }}'
      )
    ).toBe('<p>&copy; Hello World / {{ $frontmatter.no }}</p>')
  })

  test('leaves everything else to Vue', async () => {
    const expressions = [
      '{{ $frontmatter.missing }}', // key not in frontmatter
      '{{ $frontmatter.title.length }}', // path through a non-object
      '{{ $frontmatter.nothing.x }}',
      '{{ $frontmatter.nothing }}', // renders '' but may be transformed later
      '{{ $frontmatter }}',
      '{{ $frontmatter.nested }}', // objects are for Vue's display formatting
      '{{ $frontmatter.list }}',
      '{{ $frontmatter.spaced }}', // double space would be condensed
      '{{ $frontmatter.multiline }}',
      '{{ $frontmatter.list[01] }}',
      '{{ $frontmatter.title.toUpperCase() }}',
      '{{ $frontmatter[title] }}',
      '{{ $frontmatterX }}',
      '{{ $params.id }}',
      '{{ frontmatter.title }}'
    ]
    const html = await renderBody(expressions.join('\n\n'))
    for (const expression of expressions) {
      expect(html).toContain(`<p>${expression}</p>`)
    }
  })

  test('skips code and v-pre', async () => {
    const html = await render(`\
---
title: Hi
---

\`{{ $frontmatter.title }}\`

\`\`\`js
{{ $frontmatter.title }}
\`\`\`

::: v-pre
{{ $frontmatter.title }}
:::

<span v-pre>{{ $frontmatter.title }}</span> {{ $frontmatter.title }}
`)
    expect(html.match(/\{\{ \$frontmatter\.title \}\}/g)).toHaveLength(4)
    expect(html).toContain('</span> Hi</p>')
  })

  test('skips v-pre scopes from attrs', async () => {
    const html = await renderBody(
      '**{{ $frontmatter.title }}**{v-pre} {{ $frontmatter.title }}'
    )
    expect(html).toContain(
      '<strong v-pre="">{{ $frontmatter.title }}</strong> Hello World'
    )
  })

  test('stops at v-pre html blocks', async () => {
    const html = await renderBody(
      '{{ $frontmatter.title }}\n\n<div v-pre>\n\n{{ $frontmatter.title }}\n\n</div>'
    )
    // content before the block cannot be inside its scope
    expect(html).toContain('<p>Hello World</p>')
    expect(html).toContain('<p>{{ $frontmatter.title }}</p>')
  })

  test('feeds the resolved text to anchors and the page title', async () => {
    const env: Record<string, any> = {}
    const html = await render(
      `\
---
title: Hello World
---

# {{ $frontmatter.title }}
`,
      env
    )
    expect(html).toContain('id="hello-world"')
    expect(env.title).toBe('Hello World')
  })

  test('resolves link and image destinations', async () => {
    const html = await renderBody(
      [
        '[home]({{$frontmatter.homepage}})',
        '[docs](<{{ $frontmatter.homepage }}>)',
        '[nope]({{$frontmatter.nope}})'
      ].join('\n\n')
    )
    expect(html).toContain('href="https://vitepress.dev/"')
    // external link handling applies to the resolved destination
    expect(html).toContain('target="_blank"')
    // unresolvable destinations keep their expression
    expect(html).toContain('$frontmatter.nope')
  })

  test('resolves image sources', async () => {
    const html = await render(`\
---
logo: /logo.png
---

![logo]({{$frontmatter.logo}})
`)
    expect(html).toContain('src="/logo.png"')
  })

  test('leaves everything alone without frontmatter data', async () => {
    expect((await render('{{ $frontmatter.title }}')).trim()).toBe(
      '<p>{{ $frontmatter.title }}</p>'
    )
  })

  describe('equivalence with runtime interpolation', () => {
    async function ssr(html: string, $frontmatter: unknown) {
      const app = createSSRApp({ template: `<div>${html}</div>` })
      app.config.globalProperties.$frontmatter = $frontmatter
      app.config.warnHandler = () => {}
      return renderToString(app)
    }

    test('inlined values render exactly what the runtime would', async () => {
      const body = [
        'Welcome to {{ $frontmatter.title }}!',
        '{{ $frontmatter.html }}',
        '{{ $frontmatter.mustache }}',
        '{{ $frontmatter.count }} / {{ $frontmatter.flag }}',
        '{{ $frontmatter.date }}',
        'a  {{$frontmatter.title}}  b' // whitespace condensing parity
      ].join('\n\n')

      const runtimeEnv: any = {}
      const runtimeMd = await createMd({ frontmatterExpressions: false })
      const runtimeHtml = await runtimeMd.renderAsync(
        frontmatter + body,
        runtimeEnv
      )
      const resolvedHtml = await (
        await createMd()
      ).renderAsync(frontmatter + body, {})
      expect(resolvedHtml).not.toContain('$frontmatter')

      // the runtime sees the frontmatter after the `__pageData` JSON
      // round-trip; the resolved template must not need it at all
      const runtimeData = JSON.parse(JSON.stringify(runtimeEnv.frontmatter))
      expect(await ssr(resolvedHtml, { poisoned: true })).toBe(
        await ssr(runtimeHtml, runtimeData)
      )
    })
  })
})
