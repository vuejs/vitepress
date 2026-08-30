import {
  createMarkdownRenderer,
  disposeMdItInstance,
  type MarkdownOptions
} from 'node/markdown/markdown'
import { escapeHtml } from 'node/shared'
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
html: '<b>bold</b>'
mustache: '{{ x }}'
amp: 'a &lt; b'
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

async function renderBody(body: string, env: Record<string, any> = {}) {
  return (await render(frontmatter + body, env)).trim()
}

describe('node/markdown/plugins/eagerFrontmatterInterpolation', () => {
  test('resolves property paths and escapes the value', async () => {
    const html = await render(`\
---
meta:
  title: A & B
count: 2
done: false
---

{{ $frontmatter.meta.title }} / {{$frontmatter.count}} / {{ $frontmatter.done }}
`)
    expect(html).toContain('<p>A &#38; B / 2 / false</p>')
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
    // a value containing mustaches must not be interpolated again by Vue
    expect(await renderBody('{{ $frontmatter.mustache }}')).toBe(
      '<p>&#123;&#123; x &#125;&#125;</p>'
    )
    // entity look-alikes must survive the template compiler's decoding
    expect(await renderBody('{{ $frontmatter.amp }}')).toBe(
      '<p>a &#38;lt; b</p>'
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
      '{{ $frontmatter.html }}', // `<` could smuggle markup into titles
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

  test('tracks raw inline v-pre elements the way Vue parses them', async () => {
    // a quoted attribute value may contain `>`
    expect(
      await renderBody(
        '<span title="a>b" v-pre>{{ $frontmatter.title }}</span>'
      )
    ).toContain('<span title="a>b" v-pre>{{ $frontmatter.title }}</span>')
    // tag names match case-insensitively, so the inner pair nests
    expect(
      await renderBody(
        'z <span v-pre>a<SPAN>b</span>c {{ $frontmatter.title }}</SPAN> {{ $frontmatter.title }}'
      )
    ).toContain('c {{ $frontmatter.title }}</SPAN> Hello World')
    // a self-closing same-name tag does not affect the scope
    expect(
      await renderBody('<span v-pre>a<span/>b</span> {{ $frontmatter.title }}')
    ).toContain('</span> Hello World')
  })

  test('scopes v-pre in raw html blocks instead of bailing out', async () => {
    // mentions of v-pre that open no scope leave the page alone
    for (const block of [
      '<style>\n.v-pre { color: red }\n</style>',
      '<script setup>\nconst a = "v-pre"\n</script>',
      '<!-- see v-pre -->',
      '<div v-pre>{{ literal }}</div>'
    ]) {
      const html = await renderBody(`${block}\n\n{{ $frontmatter.title }}`)
      expect(html).toContain('<p>Hello World</p>')
    }

    // a scope that spans markdown ends at its closing tag
    const html = await renderBody(
      '<div v-pre>\n\n{{ $frontmatter.title }}\n\n</div>\n\n{{ $frontmatter.title }}'
    )
    expect(html).toContain('<p>{{ $frontmatter.title }}</p>')
    expect(html).toContain('<p>Hello World</p>')

    // an unclosed scope spans the rest of the page
    expect(
      await renderBody('<div v-pre>\n\n{{ $frontmatter.title }}')
    ).not.toContain('Hello World')
  })

  test('leaves whitespace-sensitive spots inside raw inline elements', async () => {
    // the runtime drops whitespace-only text nodes at element edges; an
    // inlined value would merge with that whitespace and keep it
    expect(
      await renderBody('a<code> {{ $frontmatter.title }} </code>b')
    ).toContain('<code> {{ $frontmatter.title }} </code>')
    expect(
      await renderBody('a<em>\n{{ $frontmatter.title }}\n</em>b')
    ).toContain('{{ $frontmatter.title }}')
    // non-whitespace neighbors and closing-tag adjacency are safe
    expect(await renderBody('a<em>x {{ $frontmatter.title }}</em>b')).toContain(
      '<em>x Hello World</em>'
    )
    expect(await renderBody('<em>x</em> {{ $frontmatter.title }}')).toContain(
      '</em> Hello World'
    )
  })

  test('keeps values safe when the text renderer rule is replaced', async () => {
    const md = await createMd({
      config: (md) => {
        md.renderer.rules.text = (tokens, idx) =>
          escapeHtml(tokens[idx].content)
      }
    })
    const html = await md.renderAsync(
      frontmatter + '{{ $frontmatter.mustache }} and {{ $frontmatter.title }}'
    )
    // the unsafe value renders through its own token, not the text rule
    expect(html).toContain('&#123;&#123; x &#125;&#125; and Hello World')
    expect(html).not.toContain('{{ x }}')
  })

  test('keeps toc titles escaped like the heading', async () => {
    const html = await renderBody(
      '## {{ $frontmatter.mustache }} {{ $frontmatter.amp }}\n\n[[toc]]'
    )
    expect(html).toContain('&#123;&#123; x &#125;&#125; a &#38;lt; b')
    // no live interpolation may reach the toc markup, and the toc must show
    // the same text as the heading
    const toc = html.slice(html.indexOf('<nav'))
    expect(toc).not.toContain('{{ x }}')
    expect(toc).toContain('&#123;&#123; x &#125;&#125;')
    expect(toc).toContain('a &#38;lt; b')
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

  test('records what was inlined on the env', async () => {
    const env: Record<string, any> = {}
    await renderBody(
      '{{ $frontmatter.title }} {{ $frontmatter.missing }} [x]({{$frontmatter.homepage}})',
      env
    )
    expect(env.eagerInterpolations).toEqual([
      { expression: '$frontmatter.title', value: 'Hello World' },
      { expression: '$frontmatter.homepage', value: 'https://vitepress.dev/' }
    ])
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

  test('resolves destinations even when only encoded delimiters exist', async () => {
    const html = await render(`\
---
count: 5
---

[v](https://vitepress.dev/%7B%7B$frontmatter.count%7D%7D)
`)
    expect(html).toContain('href="https://vitepress.dev/5"')
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

  test('resolves custom container titles', async () => {
    const html = await renderBody(
      '::: tip {{ $frontmatter.title }}\nbody {{ $frontmatter.count }}\n:::'
    )
    expect(html).toContain('<p class="custom-block-title">Hello World</p>')
    expect(html).toContain('<p>body 5</p>')
  })

  test('leaves everything alone without frontmatter data', async () => {
    expect((await render('{{ $frontmatter.title }}')).trim()).toBe(
      '<p>{{ $frontmatter.title }}</p>'
    )
  })

  // entries passed via `env.frontmatter` must keep merging and inlining -
  // a future `renderMd(src, env)` (#2410) relies on this
  test('merges and inlines frontmatter provided via env', async () => {
    // env entries only, no frontmatter block in the source
    const env: Record<string, any> = {
      frontmatter: { intro: 'From Env', n: 42 }
    }
    expect(
      (
        await render('{{ $frontmatter.intro }} ({{ $frontmatter.n }})', env)
      ).trim()
    ).toBe('<p>From Env (42)</p>')

    // the page's own frontmatter wins on conflicts
    const merged: Record<string, any> = {
      frontmatter: { title: 'From Env', extra: 'Extra' }
    }
    expect(
      (
        await render(
          '---\ntitle: From Page\n---\n\n{{ $frontmatter.title }} / {{ $frontmatter.extra }}',
          merged
        )
      ).trim()
    ).toBe('<p>From Page / Extra</p>')
    expect(merged.frontmatter).toEqual({ title: 'From Page', extra: 'Extra' })
  })

  describe('equivalence with runtime interpolation', () => {
    async function ssr(html: string, $frontmatter: unknown) {
      const app = createSSRApp({ template: `<div>${html}</div>` })
      app.config.globalProperties.$frontmatter = $frontmatter
      app.config.warnHandler = () => {}
      return renderToString(app)
    }

    async function compare(body: string) {
      const runtimeEnv: any = {}
      const runtimeMd = await createMd({ eagerFrontmatterInterpolation: false })
      const runtimeHtml = await runtimeMd.renderAsync(
        frontmatter + body,
        runtimeEnv
      )
      const resolvedHtml = await (
        await createMd()
      ).renderAsync(frontmatter + body, {})

      // the runtime sees the frontmatter after the `__pageData` JSON
      // round-trip
      const runtimeData = JSON.parse(JSON.stringify(runtimeEnv.frontmatter))
      expect(await ssr(resolvedHtml, runtimeData)).toBe(
        await ssr(runtimeHtml, runtimeData)
      )
      return resolvedHtml
    }

    test('inlined values render exactly what the runtime would', async () => {
      const resolvedHtml = await compare(
        [
          'Welcome to {{ $frontmatter.title }}!',
          '{{ $frontmatter.mustache }}',
          '{{ $frontmatter.amp }}',
          '{{ $frontmatter.count }} / {{ $frontmatter.flag }}',
          '{{ $frontmatter.date }}',
          'a  {{$frontmatter.title}}  b' // whitespace condensing parity
        ].join('\n\n')
      )
      // and nothing was left for the runtime to do
      expect(resolvedHtml).not.toContain('$frontmatter')
    })

    test('spots left to the runtime render identically too', async () => {
      await compare(
        [
          'a<code> {{ $frontmatter.title }} </code>b',
          'a<em>\n{{ $frontmatter.title }}\n</em>b',
          '<span title="a>b" v-pre>{{ $frontmatter.title }}</span>',
          '{{ $frontmatter.html }}',
          '{{ $frontmatter.spaced }}'
        ].join('\n\n')
      )
    })
  })
})
