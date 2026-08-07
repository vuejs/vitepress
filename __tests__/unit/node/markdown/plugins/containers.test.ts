import {
  createMarkdownRenderer,
  disposeMdItInstance,
  type MarkdownOptions
} from 'node/markdown/markdown'
import type { MarkdownEnv } from 'node/shared'

async function render(
  src: string,
  options: MarkdownOptions = {},
  env?: Partial<MarkdownEnv>
) {
  disposeMdItInstance()
  const md = await createMarkdownRenderer('.', {
    highlight: (code) => code,
    ...options
  })
  return md.renderAsync(src, env)
}

describe('node/markdown/plugins/containers', () => {
  test('renders built-in containers with default titles', async () => {
    const src = [
      'tip',
      'info',
      'warning',
      'danger',
      'note',
      'important',
      'caution'
    ]
      .map((t) => `::: ${t}\ncontent of ${t}\n:::`)
      .join('\n\n')
    expect(await render(src)).toMatchInlineSnapshot(`
      "<div class="tip custom-block"><p class="custom-block-title custom-block-title-default">TIP</p>
      <p>content of tip</p>
      </div>
      <div class="info custom-block"><p class="custom-block-title custom-block-title-default">INFO</p>
      <p>content of info</p>
      </div>
      <div class="warning custom-block"><p class="custom-block-title custom-block-title-default">WARNING</p>
      <p>content of warning</p>
      </div>
      <div class="danger custom-block"><p class="custom-block-title custom-block-title-default">DANGER</p>
      <p>content of danger</p>
      </div>
      <div class="note custom-block"><p class="custom-block-title custom-block-title-default">NOTE</p>
      <p>content of note</p>
      </div>
      <div class="important custom-block"><p class="custom-block-title custom-block-title-default">IMPORTANT</p>
      <p>content of important</p>
      </div>
      <div class="caution custom-block"><p class="custom-block-title custom-block-title-default">CAUTION</p>
      <p>content of caution</p>
      </div>
      "
    `)
  })

  test('renders details as a disclosure with summary', async () => {
    expect(await render('::: details\nhidden content\n:::'))
      .toMatchInlineSnapshot(`
        "<details class="details custom-block"><summary>Details</summary>
        <p>hidden content</p>
        </details>
        "
      `)
  })

  test('renders custom titles, including inline markdown', async () => {
    const src = [
      '::: danger STOP',
      'Danger zone, do not proceed',
      ':::',
      '',
      '::: tip A **bold** _title_ with `code`',
      'content',
      ':::',
      '',
      '::: details Click me to toggle the code',
      '```js',
      "console.log('hi')",
      '```',
      ':::'
    ].join('\n')
    expect(await render(src)).toMatchInlineSnapshot(`
      "<div class="danger custom-block"><p class="custom-block-title">STOP</p>
      <p>Danger zone, do not proceed</p>
      </div>
      <div class="tip custom-block"><p class="custom-block-title">A <strong>bold</strong> <em>title</em> with <code>code</code></p>
      <p>content</p>
      </div>
      <details class="details custom-block"><summary>Click me to toggle the code</summary>
      <div class="language-js"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">js</span><pre><code class="language-js">console.log('hi')
      </code></pre>
      </div></details>
      "
    `)
  })

  test('resolves reference links in titles', async () => {
    const src = [
      '::: tip See [the guide][guide]',
      'content',
      ':::',
      '',
      '[guide]: /guide/'
    ].join('\n')
    expect(await render(src)).toMatchInlineSnapshot(`
      "<div class="tip custom-block"><p class="custom-block-title">See <a href="/guide/">the guide</a></p>
      <p>content</p>
      </div>
      "
    `)
  })

  test('respects custom labels from container options', async () => {
    const src = '::: tip\n提示内容\n:::\n\n::: details\n详情内容\n:::'
    expect(
      await render(src, {
        container: { tipLabel: '提示', detailsLabel: '详细信息' }
      })
    ).toMatchInlineSnapshot(`
      "<div class="tip custom-block"><p class="custom-block-title custom-block-title-default">提示</p>
      <p>提示内容</p>
      </div>
      <details class="details custom-block"><summary>详细信息</summary>
      <p>详情内容</p>
      </details>
      "
    `)
  })

  test('registers custom containers from container options', async () => {
    const src = [
      '::: success',
      'You have completed the walkthrough!',
      ':::',
      '',
      '::: success Well done {no-title}',
      'content',
      ':::'
    ].join('\n')
    expect(
      await render(src, {
        container: { customContainers: { success: 'SUCCESS' } }
      })
    ).toMatchInlineSnapshot(`
      "<div class="success custom-block"><p class="custom-block-title custom-block-title-default">SUCCESS</p>
      <p>You have completed the walkthrough!</p>
      </div>
      <div class="success custom-block">
      <p>content</p>
      </div>
      "
    `)
  })

  test('rejects invalid custom container names', async () => {
    for (const name of ['raw', 'v-pre', 'code-group', 'Bad Name', 'UPPER']) {
      await expect(
        render('text', { container: { customContainers: { [name]: 'X' } } })
      ).rejects.toThrow('Invalid custom container name')
    }
  })

  test('supports attrs on the fence line', async () => {
    const src = [
      '::: details Click me {open}',
      'content',
      ':::',
      '',
      '::: tip Custom {.extra-class #custom-id}',
      'content',
      ':::'
    ].join('\n')
    expect(await render(src)).toMatchInlineSnapshot(`
      "<details open="" class="details custom-block"><summary>Click me</summary>
      <p>content</p>
      </details>
      <div class="extra-class tip custom-block" id="custom-id"><p class="custom-block-title">Custom</p>
      <p>content</p>
      </div>
      "
    `)
  })

  test('supports quoted and bare attr values on the fence line', async () => {
    expect(await render('::: tip Custom {data-a="b c" data-d=e}\ncontent\n:::'))
      .toMatchInlineSnapshot(`
        "<div data-a="b c" data-d="e" class="tip custom-block"><p class="custom-block-title">Custom</p>
        <p>content</p>
        </div>
        "
      `)
  })

  test('skips the title element with a no-title attr', async () => {
    const src = [
      '::: tip {no-title}',
      'content',
      ':::',
      '',
      '::: warning Discarded {no-title .extra-class}',
      'content',
      ':::',
      '',
      '::: details {no-title}',
      'still needs its summary',
      ':::'
    ].join('\n')
    expect(await render(src)).toMatchInlineSnapshot(`
      "<div class="tip custom-block">
      <p>content</p>
      </div>
      <div class="extra-class warning custom-block">
      <p>content</p>
      </div>
      <details class="details custom-block"><summary>Details</summary>
      <p>still needs its summary</p>
      </details>
      "
    `)
  })

  test('respects attrs plugin options on the fence line', async () => {
    const delimiters = await render(
      '::: tip Custom %(.extra-class)%\ncontent\n:::',
      { attrs: { left: '%(', right: ')%' } }
    )
    expect(delimiters).toContain('<div class="extra-class tip custom-block">')

    const allowed = await render(
      '::: tip Custom {.extra-class data-x=1}\ncontent\n:::',
      { attrs: { allowed: ['class'] } }
    )
    expect(allowed).toContain('<div class="extra-class tip custom-block">')
    expect(allowed).not.toContain('data-x')
  })

  test('keeps fence line braces verbatim when attrs are disabled', async () => {
    expect(
      await render('::: details Click me {open}\ncontent\n:::', {
        attrs: false
      })
    ).toMatchInlineSnapshot(`
      "<details class="details custom-block"><summary>Click me {open}</summary>
      <p>content</p>
      </details>
      "
    `)
  })

  test('renders v-pre and raw containers as plain wrappers', async () => {
    const src = [
      '::: v-pre',
      '{{ this will be displayed as-is }}',
      ':::',
      '',
      '::: raw',
      'Wraps in a `<div class="vp-raw">`',
      ':::'
    ].join('\n')
    expect(await render(src)).toMatchInlineSnapshot(`
      "<div v-pre>
      <p>{{ this will be displayed as-is }}</p>
      </div>
      <div class="vp-raw">
      <p>Wraps in a <code>&lt;div class=&quot;vp-raw&quot;&gt;</code></p>
      </div>
      "
    `)
  })

  test('renders code groups with tabs', async () => {
    const src = [
      '::: code-group',
      '',
      '```js [config.js]',
      'const a = 1',
      '```',
      '',
      '```ts [config.ts]',
      'const a: number = 1',
      '```',
      '',
      ':::'
    ].join('\n')
    expect(await render(src)).toMatchInlineSnapshot(`
      "<div class="vp-code-group"><div class="tabs"><input type="radio" name="group-0" id="tab-1" checked><label data-title="config.js" for="tab-1">config.js</label><input type="radio" name="group-0" id="tab-2" ><label data-title="config.ts" for="tab-2">config.ts</label></div><div class="blocks">
      <div class="language-js active"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">js</span><pre><code class="language-js">const a = 1
      </code></pre>
      </div><div class="language-ts"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">ts</span><pre><code class="language-ts">const a: number = 1
      </code></pre>
      </div></div></div>
      "
    `)
  })

  test('supports nesting via longer fences', async () => {
    const src = [
      ':::: info Outer',
      'outer content',
      '',
      '::: details Inner',
      'inner content',
      ':::',
      '::::'
    ].join('\n')
    expect(await render(src)).toMatchInlineSnapshot(`
      "<div class="info custom-block"><p class="custom-block-title">Outer</p>
      <p>outer content</p>
      <details class="details custom-block"><summary>Inner</summary>
      <p>inner content</p>
      </details>
      </div>
      "
    `)
  })

  test('auto-closes unclosed containers', async () => {
    expect(await render('::: warning\nno closing fence'))
      .toMatchInlineSnapshot(`
        "<div class="warning custom-block"><p class="custom-block-title custom-block-title-default">WARNING</p>
        <p>no closing fence</p>
        </div>
        "
      `)
  })

  test('parses fences without a space before the name', async () => {
    expect(await render(':::tip\ncontent\n:::')).toMatchInlineSnapshot(`
      "<div class="tip custom-block"><p class="custom-block-title custom-block-title-default">TIP</p>
      <p>content</p>
      </div>
      "
    `)
  })

  test('leaves non-container fence lines alone', async () => {
    expect(await render('::: unknown\ncontent\n:::')).toMatchInlineSnapshot(`
      "<p>::: unknown
      content
      :::</p>
      "
    `)
  })
})

describe('node/markdown/plugins/containers (github alerts)', () => {
  test('renders github alerts like containers', async () => {
    const src = [
      '> [!NOTE]',
      '> note content',
      '',
      '> [!TIP]',
      '> tip content',
      '',
      '> [!IMPORTANT]',
      '> important content',
      '',
      '> [!WARNING]',
      '> warning content',
      '',
      '> [!CAUTION]',
      '> caution content'
    ].join('\n')
    expect(await render(src)).toMatchInlineSnapshot(`
      "<div class="note custom-block github-alert"><p class="custom-block-title">NOTE</p>
      <p>note content</p>
      </div>
      <div class="tip custom-block github-alert"><p class="custom-block-title">TIP</p>
      <p>tip content</p>
      </div>
      <div class="important custom-block github-alert"><p class="custom-block-title">IMPORTANT</p>
      <p>important content</p>
      </div>
      <div class="warning custom-block github-alert"><p class="custom-block-title">WARNING</p>
      <p>warning content</p>
      </div>
      <div class="caution custom-block github-alert"><p class="custom-block-title">CAUTION</p>
      <p>caution content</p>
      </div>
      "
    `)
  })

  test('matches markers case-insensitively', async () => {
    expect(await render('> [!tip]\n> content')).toMatchInlineSnapshot(`
      "<div class="tip custom-block github-alert"><p class="custom-block-title">TIP</p>
      <p>content</p>
      </div>
      "
    `)
  })

  test('supports custom titles after the marker', async () => {
    expect(await render('> [!WARNING] Custom Title\n> content'))
      .toMatchInlineSnapshot(`
      "<div class="warning custom-block github-alert"><p class="custom-block-title">Custom Title</p>
      <p>content</p>
      </div>
      "
    `)
  })

  test('respects custom labels from container options', async () => {
    expect(
      await render('> [!TIP]\n> content', { container: { tipLabel: '提示' } })
    ).toMatchInlineSnapshot(`
      "<div class="tip custom-block github-alert"><p class="custom-block-title">提示</p>
      <p>content</p>
      </div>
      "
    `)
  })

  test('renders custom containers as alerts', async () => {
    expect(
      await render('> [!SUCCESS]\n> done\n\n> [!success] With title\n> done', {
        container: { customContainers: { success: 'SUCCESS' } }
      })
    ).toMatchInlineSnapshot(`
      "<div class="success custom-block github-alert"><p class="custom-block-title">SUCCESS</p>
      <p>done</p>
      </div>
      <div class="success custom-block github-alert"><p class="custom-block-title">With title</p>
      <p>done</p>
      </div>
      "
    `)
  })

  test('supports block content and lazy continuation', async () => {
    const src = [
      '> [!NOTE]',
      '> first paragraph',
      'lazy continuation',
      '>',
      '> - list item',
      '>',
      '> ```js',
      '> const a = 1',
      '> ```'
    ].join('\n')
    expect(await render(src)).toMatchInlineSnapshot(`
      "<div class="note custom-block github-alert"><p class="custom-block-title">NOTE</p>
      <p>first paragraph
      lazy continuation</p>
      <ul>
      <li>list item</li>
      </ul>
      <div class="language-js"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">js</span><pre><code class="language-js">const a = 1
      </code></pre>
      </div></div>
      "
    `)
  })

  test('converts markers without content', async () => {
    expect(await render('> [!NOTE]')).toMatchInlineSnapshot(`
      "<div class="note custom-block github-alert"><p class="custom-block-title">NOTE</p>
      <p></p>
      </div>
      "
    `)
  })

  test('leaves regular blockquotes and unknown markers alone', async () => {
    const src = [
      '> just a quote',
      '',
      '> [!FOO]',
      '> not an alert',
      '',
      'paragraph [!NOTE] not at blockquote start'
    ].join('\n')
    expect(await render(src)).toMatchInlineSnapshot(`
      "<blockquote>
      <p>just a quote</p>
      </blockquote>
      <blockquote>
      <p>[!FOO]
      not an alert</p>
      </blockquote>
      <p>paragraph [!NOTE] not at blockquote start</p>
      "
    `)
  })

  test('can be disabled via gfmAlerts: false', async () => {
    expect(await render('> [!NOTE]\n> content', { gfmAlerts: false }))
      .toMatchInlineSnapshot(`
      "<blockquote>
      <p>[!NOTE]
      content</p>
      </blockquote>
      "
    `)
  })
})

describe('node/markdown/plugins/containers (locales)', () => {
  const options: MarkdownOptions = {
    container: {
      tipLabel: 'ROOT TIP',
      customContainers: { success: 'SUCCESS' }
    },
    locales: {
      zh: {
        container: {
          tipLabel: '提示',
          detailsLabel: '详细信息',
          customContainers: { success: '成功' }
        }
      }
    }
  }

  test('resolves container titles for the active locale', async () => {
    const src =
      '::: tip\n内容\n:::\n\n::: details\n内容\n:::\n\n::: success\n内容\n:::'
    expect(await render(src, options, { localeIndex: 'zh' }))
      .toMatchInlineSnapshot(`
        "<div class="tip custom-block"><p class="custom-block-title custom-block-title-default">提示</p>
        <p>内容</p>
        </div>
        <details class="details custom-block"><summary>详细信息</summary>
        <p>内容</p>
        </details>
        <div class="success custom-block"><p class="custom-block-title custom-block-title-default">成功</p>
        <p>内容</p>
        </div>
        "
      `)
  })

  test('falls back to root titles for other locales', async () => {
    const src = '::: tip\ncontent\n:::'
    const root = await render(src, options)
    expect(await render(src, options, { localeIndex: 'es' })).toBe(root)
    expect(root).toMatchInlineSnapshot(`
      "<div class="tip custom-block"><p class="custom-block-title custom-block-title-default">ROOT TIP</p>
      <p>content</p>
      </div>
      "
    `)
  })

  test('explicit titles win over locale defaults', async () => {
    expect(
      await render('::: tip Custom Title\n内容\n:::', options, {
        localeIndex: 'zh'
      })
    ).toMatchInlineSnapshot(`
      "<div class="tip custom-block"><p class="custom-block-title">Custom Title</p>
      <p>内容</p>
      </div>
      "
    `)
  })

  test('resolves alert titles for the active locale', async () => {
    expect(
      await render('> [!TIP]\n> 内容\n\n> [!SUCCESS]\n> 内容', options, {
        localeIndex: 'zh'
      })
    ).toMatchInlineSnapshot(`
      "<div class="tip custom-block github-alert"><p class="custom-block-title">提示</p>
      <p>内容</p>
      </div>
      <div class="success custom-block github-alert"><p class="custom-block-title">成功</p>
      <p>内容</p>
      </div>
      "
    `)
  })

  test('rejects locale titles for unregistered containers', async () => {
    await expect(
      render('text', {
        locales: { zh: { container: { customContainers: { nope: 'X' } } } }
      })
    ).rejects.toThrow('is not registered in the root markdown config')
  })

  test('resolves the code copy button strings for the active locale', async () => {
    const src = '```js\nconst a = 1\n```'
    const opts: MarkdownOptions = {
      codeCopyButton: { copiedText: 'Copied!' },
      locales: {
        zh: {
          codeCopyButton: { tooltipText: '复制代码', copiedText: '已复制' }
        }
      }
    }
    const zh = await render(src, opts, { localeIndex: 'zh' })
    expect(zh).toContain('title="复制代码"')
    expect(zh).toContain('data-copied="已复制"')
    const es = await render(src, opts, { localeIndex: 'es' })
    expect(es).toContain('title="Copy code"')
    expect(es).toContain('data-copied="Copied!"')
    const root = await render(src, opts)
    expect(root).toContain('title="Copy code"')
    expect(root).toContain('data-copied="Copied!"')
  })
})
