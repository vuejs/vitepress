import {
  createMarkdownRenderer,
  disposeMdItInstance,
  type MarkdownOptions
} from 'node/markdown/markdown'

const flowchart = '```mermaid\nflowchart LR\n  A[Start] --> B[End]\n```\n'
const broken = '```mermaid\nflowchart LR\n  A -->\n```\n'

async function render(
  src: string,
  options: MarkdownOptions = {},
  env: Record<string, unknown> = { relativePath: 'guide/diagrams.md' },
  warn: (msg: string) => void = () => {}
) {
  disposeMdItInstance()
  const md = await createMarkdownRenderer(
    '.',
    { highlight: (code) => code, mermaid: true, ...options },
    '/',
    { warn }
  )
  return md.renderAsync(src, env)
}

describe('node/markdown/plugins/mermaid', () => {
  test('is off by default', async () => {
    const html = await render(flowchart, { mermaid: undefined })
    expect(html).toContain('language-mermaid')
    expect(html).not.toContain('vp-mermaid')
  })

  test('renders mermaid blocks as inline svg', async () => {
    const html = await render(flowchart)
    expect(html).toMatch(
      /^<div class="vp-mermaid" data-type="flowchart" data-zoom="auto" v-pre><svg /
    )
    expect(html).toContain('class="pele pele-flowchart"')
    expect(html).toContain('>Start</text>')
    // zoom controls are emitted hidden, for the client to reveal
    expect(html).toContain('<div class="vp-mermaid-controls" hidden>')
    expect(html).toContain('aria-label="Zoom in"')
    expect(html).toContain('aria-label="Reset zoom"')
    expect(html.trimEnd().endsWith('</div>')).toBe(true)
  })

  test('keeps mmd and mermaid-vue blocks as code', async () => {
    const mmd = await render('```mmd\nflowchart LR\n  A --> B\n```\n')
    expect(mmd).toContain('language-mmd')
    expect(mmd).not.toContain('vp-mermaid')

    const vue = await render('```mermaid-vue\nflowchart LR\n  A --> B\n```\n')
    expect(vue).toContain('language-mermaid')
    expect(vue).not.toContain('vp-mermaid')
  })

  test('renders errors in place with the source and warns', async () => {
    const warnings: string[] = []
    const html = await render(broken, {}, { relativePath: 'a/b.md' }, (m) =>
      warnings.push(m)
    )
    expect(html).toContain('class="vp-mermaid vp-mermaid-error"')
    expect(html).toContain(
      '<p class="vp-mermaid-error-title">Unable to render diagram</p>'
    )
    expect(html).toMatch(/<pre v-pre>Parse error on line \d+:/)
    // the source is shown as a highlighted code block
    expect(html).toContain('<div class="language-mermaid"')
    expect(html).toContain('<code class="language-mermaid">flowchart LR')
    expect(warnings).toHaveLength(1)
    expect(warnings[0]).toContain(
      'a/b.md: mermaid diagram could not be rendered'
    )
    expect(warnings[0]).toContain('Parse error')
  })

  test('throws on errors when asked', async () => {
    await expect(
      render(
        broken,
        { mermaid: { onError: 'throw' } },
        { relativePath: 'x.md' }
      )
    ).rejects.toThrow(/x\.md: mermaid diagram could not be rendered/)
  })

  test('localizes the labels', async () => {
    const options: MarkdownOptions = {
      mermaid: { zoomInLabel: 'Enlarge' },
      locales: {
        zh: { mermaid: { zoomInLabel: '放大', errorLabel: '无法渲染图表' } }
      }
    }
    const root = await render(flowchart, options)
    expect(root).toContain('aria-label="Enlarge"')

    const zh = await render(flowchart, options, { localeIndex: 'zh' })
    expect(zh).toContain('aria-label="放大"')
    expect(zh).toContain('aria-label="Zoom out"')

    const zhError = await render(broken, options, { localeIndex: 'zh' })
    expect(zhError).toContain('无法渲染图表')
  })

  test('configures zoom', async () => {
    const off = await render(flowchart, { mermaid: { zoom: false } })
    expect(off).not.toContain('data-zoom')
    expect(off).not.toContain('vp-mermaid-controls')

    const always = await render(flowchart, { mermaid: { zoom: true } })
    expect(always).toContain('data-zoom="always"')

    const custom = await render(flowchart, {
      mermaid: { zoom: { always: true, maxScale: 5 } }
    })
    expect(custom).toContain('data-zoom="always" data-zoom-max="5"')
  })

  test('gives each diagram its own accessibility ids', async () => {
    const titled =
      '```mermaid\nflowchart LR\n  accTitle: Flow\n  A --> B\n```\n'
    const html = await render(titled + '\n' + titled)
    expect(html).toContain('id="vp-mermaid-1-title"')
    expect(html).toContain('id="vp-mermaid-2-title"')
  })

  test('passes render options through', async () => {
    const html = await render(flowchart, {
      mermaid: { fontFamily: 'Georgia, serif', responsive: false }
    })
    expect(html).toContain('font-family:var(--pele-font,Georgia, serif)')
    expect(html).not.toContain('max-width:100%')
  })

  test('measures labels in Inter unless another font is given', async () => {
    const width = (html: string) =>
      Number(/<rect [^>]*width="([\d.]+)"/.exec(html)![1])
    const inter = await render(flowchart)
    const arial = await render(flowchart, { mermaid: { fontFamily: 'Arial' } })
    expect(inter).toContain('font-family:var(--pele-font,Inter, sans-serif)')
    expect(width(inter)).toBeGreaterThan(width(arial))
  })

  test('resolves icons from the installed iconify collections', async () => {
    const warnings: string[] = []
    const html = await render(
      '```mermaid\narchitecture-beta\n  service a(lucide:cloud)[Cloud]\n  service b(fa:fa-car)[Car]\n```\n',
      {},
      {},
      (m) => warnings.push(m)
    )
    expect(html).toMatch(
      /data-icon="lucide:cloud"[^>]*><svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" stroke="none">/
    )
    // mermaid's font awesome shorthand maps to its iconify collection
    expect(warnings).toHaveLength(1)
    expect(warnings[0]).toContain('npm add -D @iconify-json/fa6-solid')
  })

  test('accepts a custom icon resolver', async () => {
    const html = await render(
      '```mermaid\narchitecture-beta\n  service a(my:icon)[Mine]\n```\n',
      {
        mermaid: {
          icons: (name) => (name === 'my:icon' ? '<circle r="12"/>' : null)
        }
      }
    )
    expect(html).toContain('data-icon="my:icon"')
    expect(html).toContain('<circle r="12"/>')
  })
})
