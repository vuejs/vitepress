import {
  createMarkdownRenderer,
  disposeMdItInstance
} from 'node/markdown/markdown'

async function render(src: string, env: Record<string, any> = {}) {
  disposeMdItInstance()
  const md = await createMarkdownRenderer('.', { highlight: (code) => code })
  return md.renderAsync(src, env)
}

describe('node/markdown/plugins/frontmatterExpressions', () => {
  test('resolves property paths and escapes the value', async () => {
    const html = await render(`---
meta:
  title: A <b>& B
count: 2
done: false
---

{{ $frontmatter.meta.title }} / {{$frontmatter.count}} / {{ $frontmatter.done }}
`)
    expect(html).toContain('<p>A &lt;b&gt;&amp; B / 2 / false</p>')
  })

  test('leaves everything else to Vue', async () => {
    const expressions = [
      '{{ $frontmatter.missing }}',
      '{{ $frontmatter.list }}',
      '{{ $frontmatter.title.length }}',
      "{{ $frontmatter['title'] }}",
      '{{ $frontmatter.mustache }}'
    ]
    const html = await render(`---
title: Hi
list: [1, 2]
mustache: "{{ x }}"
---

${expressions.join('\n\n')}
`)
    for (const expression of expressions) {
      expect(html).toContain(`<p>${expression}</p>`)
    }
  })

  test('skips code and v-pre', async () => {
    const html = await render(`---
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

  test('feeds the resolved text to anchors and the page title', async () => {
    const env: Record<string, any> = {}
    const html = await render(
      `---
title: Hello World
---

# {{ $frontmatter.title }}
`,
      env
    )
    expect(html).toContain('id="hello-world"')
    expect(env.title).toBe('Hello World')
  })
})
