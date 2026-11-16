import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { container } from '@mdit/plugin-container'
import { resolveConfig } from 'node/config'
import {
  createMarkdownRenderer,
  disposeMdItInstance,
  type MarkdownOptions
} from 'node/markdown/markdown'
import {
  hoistStaticCode,
  toStaticExpression,
  unmarkStaticCode
} from 'node/markdown/plugins/staticCode'
import { createMarkdownToVueRenderFn } from 'node/markdownToVue'
import { removeStaticMarkers } from 'node/utils/leanChunk'
import { compileTemplate } from 'vue/compiler-sfc'
// the full build, for compiling templates the way the Vue plugin would
// @ts-expect-error no types for dist builds
import { createSSRApp } from 'vue/dist/vue.cjs.js'
import { renderToString } from 'vue/server-renderer'

const block =
  '<pre class="shiki github-dark" style="color:#fff" tabindex="0" dir="ltr" v-pre="">' +
  '<code><span class="line"><span style="color:#f00">a &#x3C; `b` ${c} \\d \'e\'</span></span>\n' +
  '<span class="line"><wbr></span></code></pre>'
const blockContent = block.slice(block.indexOf('<code>'), -'</pre>'.length)

/** The text that an expression evaluates to. */
const evaluate = (expression: string): string =>
  new Function(`return ${expression}`)()

/** The content of the rewritten code blocks in a template. */
const contents = (html: string) =>
  [...html.matchAll(/<pre(?: [\w-]+="[^"]*")* v-html='([^']*)'><\/pre>/g)].map(
    ([, expression]) => removeStaticMarkers(evaluate(expression))
  )

/** The HTML that the server renders for a template. */
function ssr(template: string): Promise<string> {
  const app = createSSRApp({
    template: `<div>${removeStaticMarkers(template)}</div>`
  })
  app.config.warnHandler = (message: string) => {
    throw new Error(message)
  }
  return renderToString(app)
}

/**
 * The elements, attributes and text of some HTML, as Vue's parser reads them.
 * Vue writes a `style` it has parsed back with a `;` at its end.
 */
function dom(html: string): unknown {
  const { ast, errors } = compileTemplate({
    source: `<div v-pre>${html}</div>`,
    id: 'test',
    filename: 'test.vue'
  })
  expect(errors).toEqual([])
  const read = (node: any): unknown =>
    node.type === 1
      ? [
          node.tag,
          Object.fromEntries(
            node.props.map((prop: any) => [
              prop.name,
              (prop.value?.content ?? '').replace(/;$/, '')
            ])
          ),
          node.children.map(read)
        ]
      : (node.content?.content ?? node.content)
  return (ast as any).children.map(read)
}

describe('node/markdown/plugins/staticCode: one highlighted block', () => {
  test('moves the children of a static block into v-html', () => {
    const html = hoistStaticCode(block)
    expect(html).toMatch(
      /^<pre class="shiki github-dark" style="color:#fff" tabindex="0" dir="ltr" v-html='`__VP_STATIC_START__<code>[^']*<\/code>__VP_STATIC_END__`'><\/pre>$/
    )
    expect(contents(html)).toEqual([blockContent])
  })

  test('reads an attribute value that has > in it', () => {
    const html = hoistStaticCode(
      block.replace(' tabindex', ' title="a>b" tabindex')
    )
    expect(html).toContain(' title="a>b" tabindex="0"')
    expect(contents(html)).toEqual([blockContent])
  })

  test('keeps data and aria attributes', () => {
    const html = hoistStaticCode(
      block.replace(' tabindex', ' data-lang="ts" aria-label="code" tabindex')
    )
    expect(html).toContain(' data-lang="ts" aria-label="code" tabindex="0"')
    expect(contents(html)).toHaveLength(1)
  })

  test.each([
    ['a block that Vue interpolates', block.replace(' v-pre=""', '')],
    ['a newline after the opening tag', block.replace('<code>', '\n<code>')],
    ['another element', block.replace('<wbr>', '<a href="#">x</a>')],
    ['a component', block.replace('<wbr>', '<VMenu></VMenu>')],
    ['a comment', block.replace('<wbr>', '<!-- x -->')],
    ['another character reference', block.replace('&#x3C;', '&copy;')],
    ['a bare ampersand', block.replace('&#x3C;', '&')],
    ['a carriage return', block.replace('\n', '\r\n')],
    ['a bound attribute', block.replace(' tabindex', ' :class="a" tabindex')],
    ['a directive', block.replace(' tabindex', ' v-if="a" tabindex')],
    ['an unquoted attribute', block.replace('dir="ltr"', 'dir=ltr')],
    ['an empty block', '<pre v-pre></pre>'],
    ['text after the block', `${block}\n<p>a</p>`],
    ['text before the block', `<p>a</p>${block}`],
    ['two blocks', block + block],
    ['a lean chunk marker', block.replace('a ', '__VP_STATIC_START__ ')]
  ])('leaves %s as it is', (_name, html) => {
    expect(hoistStaticCode(html)).toBe(html)
  })

  // Every string up to four characters long over the characters that mean
  // something to a template literal, to an attribute value or to HTML.
  test('the expression evaluates to the text, for all short texts', () => {
    const alphabet = [...'\\`${}&"\'<\n;#x2']
    let texts = ['']
    const wrong: string[] = []
    for (let length = 1; length <= 4; length++) {
      texts = texts.flatMap((text) => alphabet.map((char) => text + char))
      for (const text of texts) {
        const expression = toStaticExpression(text)
        // It is the value of an attribute in single quotes, as it is.
        if (/['&]/.test(expression) || evaluate(expression) !== text) {
          wrong.push(text)
        }
      }
    }
    expect(wrong).toEqual([])
  })

  // The same through Vue's own parser.
  test('Vue reads the expression as the text', () => {
    const alphabet = [...'\\`${&"\'<>\n', '&amp;', '&#x3C;', '{{ a }}', '\\x26']
    const texts = alphabet.flatMap((a) => alphabet.map((b) => a + b))
    for (const text of [...alphabet, ...texts, blockContent]) {
      const { ast, errors } = compileTemplate({
        source: `<pre v-html='${toStaticExpression(text)}'></pre>`,
        id: 'test',
        filename: 'test.vue'
      })
      expect(errors).toEqual([])
      const directive = (ast as any).children[0].props[0]
      expect(directive.name).toBe('html')
      expect(evaluate(directive.exp.content)).toBe(text)
    }
  })
})

describe('node/markdown/plugins/staticCode: pages', () => {
  let root: string

  beforeEach(async () => {
    root = await mkdtemp(path.join(tmpdir(), 'vitepress-static-code-'))
  })
  afterEach(async () => {
    disposeMdItInstance()
    await rm(root, { recursive: true, force: true })
  })

  /** The template of a page. */
  async function template(
    src: string,
    options: MarkdownOptions = {}
  ): Promise<string> {
    disposeMdItInstance()
    const file = path.join(root, 'index.md')
    await writeFile(file, src)
    const siteConfig = await resolveConfig(root, 'build', 'production')
    const render = await createMarkdownToVueRenderFn(
      siteConfig.srcDir,
      { cache: false, ...options },
      '/',
      false,
      false,
      siteConfig
    )
    const { vueSrc } = await render(src, file)
    return vueSrc.slice(
      vueSrc.indexOf('<template><div>') + '<template><div>'.length,
      vueSrc.lastIndexOf('</div></template>')
    )
  }

  /** The HTML of the same page for anything but a page component. */
  async function plainHtml(src: string, options: MarkdownOptions = {}) {
    disposeMdItInstance()
    const md = await createMarkdownRenderer(root, options)
    return md.renderAsync(src, {
      path: path.join(root, 'index.md'),
      relativePath: 'index.md',
      cleanUrls: false
    })
  }

  const fence = (code: string, info = 'js') =>
    `\`\`\`${info}\n${code}\n\`\`\`\n`
  const preText =
    '<pre class="shiki" v-pre><code><span class="line">x</span></code></pre>'

  test('rewrites every fence of a page', async () => {
    const html = await template(
      `${fence('const a = 1')}\n${fence('const b = 2', 'ts')}\n${fence('c')}`
    )
    expect(contents(html)).toHaveLength(3)
    expect(html).not.toContain('v-pre')
  })

  test('leaves the HTML for content loaders and the search as it is', async () => {
    const html = await plainHtml(fence('const a = 1'))
    expect(html).toContain(' v-pre')
    expect(html).not.toContain('v-html')
  })

  test('the server renders the page that it rendered before', async () => {
    const src = [
      fence('const a = `${b}` + \'c\' + "d" // <e> & \\f {{ g }}'),
      fence('<p class="a">{{ b }}</p>\n\n<!-- c -->', 'html'),
      fence('a: 1 # é 日本語 🎉', 'yaml'),
      fence('$ npm i\n> out', 'sh')
    ].join('\n')
    const hoisted = await template(src)
    expect(contents(hoisted)).toHaveLength(4)
    expect(dom(await ssr(hoisted))).toEqual(
      dom(await ssr(await plainHtml(src)))
    )
  })

  test('the client is given the HTML that the server renders', async () => {
    const hoisted = removeStaticMarkers(
      await template(fence("const a = `${b}` + 'c' // <d> & \\e"))
    )
    const [content] = contents(hoisted)
    const { code, errors } = compileTemplate({
      source: `<div>${hoisted}</div>`,
      id: 'test',
      filename: 'test.vue'
    })
    expect(errors).toEqual([])
    // Vue keeps the content as one string: in a static node, or in a prop.
    const strings = [...code.matchAll(/"(?:[^"\\\n]|\\.)*"|`(?:[^`\\]|\\.)*`/g)]
    expect(
      strings.some(([literal]) => evaluate(literal).includes(content))
    ).toBe(true)
    expect(await ssr(hoisted)).toContain(`>${content}</pre>`)
  })

  test.each([
    ['an attribute value', `<div title='${preText}'>a</div>`],
    ['a comment', `<div><!-- ${preText} --></div>`],
    [
      'a script',
      `<div><script type="application/json">{"a":'${preText}'}</script></div>`
    ],
    [
      'a style',
      `<div><style>.a::after { content: '${preText}' }</style></div>`
    ],
    ['raw HTML', `<div>${preText}</div>`]
  ])('leaves the text of a code block in %s alone', async (_name, raw) => {
    const html = await template(`${raw}\n\n${fence('const a = 1')}`)
    expect(html).toContain(raw)
    expect(contents(html)).toHaveLength(1)
  })

  test('rewrites the fences of a page that mentions v-pre', async () => {
    const html = await template(
      `Use the v-pre directive, or \`v-pre\`.\n\n${fence('v-pre')}`
    )
    expect(contents(html)).toHaveLength(1)
  })

  test.each([
    ['a v-pre container', `::: v-pre\n${fence('a')}:::\n`],
    ['raw HTML with v-pre', `<div v-pre>\n\n${fence('a')}\n</div>\n`],
    [
      'a list with a v-pre attribute',
      `- a\n\n  ${fence('a').replace(/\n(?=.)/g, '\n  ')}{v-pre}\n`
    ]
  ])('leaves a fence in %s alone', async (_name, src) => {
    const html = await template(`${src}\n${fence('b')}`)
    // The one after the scope is rewritten, the one in it is not.
    expect(contents(html)).toHaveLength(1)
    expect(html).toMatch(/<pre class="shiki[^>]* v-pre(="")?>/)
  })

  test('leaves the fences of a page with an element whose content is text', async () => {
    const html = await template(`<textarea>\n\n${fence('a')}\n</textarea>\n`)
    expect(contents(html)).toHaveLength(0)
  })

  test('rewrites a fence in a container of VitePress', async () => {
    const html = await template(
      `::: tip\n${fence('a')}:::\n\n::: mine\n${fence('b')}:::\n`,
      { container: { customContainers: { mine: 'Mine' } } }
    )
    expect(contents(html)).toHaveLength(2)
  })

  test('leaves a fence under a token of a plugin alone', async () => {
    const html = await template(`::: demo\n${fence('a')}:::\n\n${fence('b')}`, {
      config(md) {
        md.use(container, {
          name: 'demo',
          openRender: () => '<div v-pre>',
          closeRender: () => '</div>'
        })
      }
    })
    expect(contents(html)).toHaveLength(1)
  })

  test('leaves the markdown that a plugin renders on its own alone', async () => {
    const html = await template(`::: nested\n:::\n\n${fence('b')}`, {
      config(md) {
        md.use(container, {
          name: 'nested',
          openRender: (_tokens, _idx, _options, env) =>
            `<div v-pre>${md.render(fence('a'), env)}`,
          closeRender: () => '</div>'
        })
      }
    })
    expect(contents(html)).toHaveLength(1)
    expect(html).toMatch(/<div v-pre><div class="language-js[^]*? v-pre/)
  })

  test('rewrites what a custom transformer keeps static', async () => {
    const withTransformer = (transformer: object) =>
      template(fence('a'), { codeTransformers: [transformer] })

    const [content] = contents(
      await withTransformer({
        line: (node: any) => void (node.properties['data-line'] = '1')
      })
    )
    expect(content).toContain('data-line="1"')

    const component = await withTransformer({
      line: (node: any) =>
        void node.children.push({
          type: 'element',
          tagName: 'VMenu',
          properties: {},
          children: [{ type: 'text', value: 'a' }]
        })
    })
    expect(contents(component)).toHaveLength(0)
  })

  test('rewrites the block of a highlighter of the config', async () => {
    const html = await template(fence('a < b'), {
      highlight: (code) =>
        `<pre class="mine" v-pre><code>${code.replace('<', '&lt;')}</code></pre>`
    })
    expect(contents(html)).toEqual(['<code>a &lt; b\n</code>'])
  })

  test('keeps line numbers, titles and code groups', async () => {
    const src = `::: code-group\n\n${fence('a\nb\nc', 'js:line-numbers [one.js]')}\n${fence('d', 'ts [two.ts]')}\n:::\n`
    const html = await template(src)
    expect(contents(html)).toHaveLength(2)
    expect(html.split('<span class="line-number">').length - 1).toBe(3)
    expect(html.replace(/ v-html='[^']*'/g, '')).toBe(
      (await plainHtml(src)).replace(/ v-pre(="")?>[^]*?<\/pre>/g, '></pre>')
    )
  })

  test('leaves a block that Vue interpolates alone', async () => {
    const html = await template(fence('{{ 1 + 1 }}', 'js-vue'))
    expect(contents(html)).toHaveLength(0)
    expect(html).toContain('{{ 1 + 1 }}')
  })

  test('rewrites a fence in an alert', async () => {
    const html = await template(
      `> [!NOTE]\n> ${fence('a').replace(/\n(?=.)/g, '\n> ')}`
    )
    expect(contents(html)).toHaveLength(1)
  })

  test('leaves a container that is not the one of VitePress alone', async () => {
    const html = await template(`::: tip\n${fence('a')}:::\n`, {
      container: false,
      config(md) {
        md.use(container, {
          name: 'tip',
          openRender: () => '<div v-pre>',
          closeRender: () => '</div>'
        })
      }
    })
    expect(contents(html)).toHaveLength(0)
  })

  test.each([
    ['the highlighter of VitePress', {}],
    [
      'a highlighter that returns the block at once',
      {
        highlight: (code: string) => `<pre v-pre><code>${code}</code></pre>`
      }
    ]
  ])(
    'leaves a fence that a rule of a plugin puts in v-pre alone: %s',
    async (_name, options: MarkdownOptions) => {
      const html = await template(fence('a'), {
        ...options,
        config(md) {
          const rule = md.renderer.rules.fence!
          md.renderer.rules.fence = (...args) =>
            `<div v-pre class="demo">${rule(...args)}</div>`
        }
      })
      expect(contents(html)).toHaveLength(0)
      expect(html).toMatch(/<div v-pre class="demo">[^]*<pre[^>]* v-pre/)
    }
  )

  test('rewrites a block that a highlighter returns at once', async () => {
    const html = await template(fence('a'), {
      highlight: (code) => `<pre v-pre><code>${code}</code></pre>`,
      preWrapper: false
    })
    expect(contents(html)).toEqual(['<code>a\n</code>'])
  })

  test('renders the fence of a highlighter that returns nothing as before', async () => {
    const options: MarkdownOptions = { highlight: () => undefined as any }
    expect(await template(fence('a < b'), options)).toBe(
      await plainHtml(fence('a < b'), options)
    )
  })

  test('rewrites the page when a plugin parses markdown of its own first', async () => {
    const html = await template(fence('a'), {
      config(md) {
        let nested = false
        md.block.ruler.before('fence', 'nested', (state) => {
          if (!nested) {
            nested = true
            md.parse(fence('b'), state.env)
            nested = false
          }
          return false
        })
      }
    })
    expect(contents(html)).toHaveLength(1)
  })

  test('takes the markers out of the code blocks of a template only', async () => {
    const html = await template(`\`__VP_STATIC_START__\`\n\n${fence('a')}`)
    const unmarked = unmarkStaticCode(html)
    expect(unmarked).toContain('<code>__VP_STATIC_START__</code>')
    expect(unmarked.split('__VP_STATIC_').length - 1).toBe(1)
    expect(removeStaticMarkers(html)).toBe(
      unmarked.replace('__VP_STATIC_START__', '')
    )
  })
})
