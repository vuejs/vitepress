import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import {
  createMarkdownRenderer,
  disposeMdItInstance,
  type MarkdownOptions
} from 'node/markdown/markdown'
import { slash, type MarkdownEnv } from 'node/shared'

describe('node/markdown/plugins/include', () => {
  let root: string
  let warnings: string[]

  const logger = {
    warn: (msg: string) => {
      warnings.push(msg)
    }
  }

  beforeEach(async () => {
    root = await mkdtemp(path.join(tmpdir(), 'vitepress-include-'))
    warnings = []
  })

  afterEach(async () => {
    await rm(root, { recursive: true, force: true })
  })

  async function write(name: string, src: string) {
    const file = path.join(root, name)
    await mkdir(path.dirname(file), { recursive: true })
    await writeFile(file, src)
  }

  async function render(
    src: string,
    options: MarkdownOptions = {},
    env: Partial<MarkdownEnv> = {}
  ) {
    disposeMdItInstance()
    const md = await createMarkdownRenderer(
      root,
      { highlight: (code) => code, ...options },
      '/',
      logger
    )
    const fullEnv: MarkdownEnv = {
      path: path.join(root, 'index.md'),
      relativePath: 'index.md',
      cleanUrls: false,
      includes: [],
      ...env
    }
    const html = await md.renderAsync(src, fullEnv)
    return { html, env: fullEnv }
  }

  test('includes a relative markdown file', async () => {
    await write('b.md', 'B-content\n')

    const { html, env } = await render('# A\n\n<!-- @include: ./b.md -->\n')
    expect(html).toContain('B-content')
    expect(env.includes).toEqual([slash(path.join(root, 'b.md'))])
    expect(env.src).toContain('B-content')
  })

  test('resolves @ against srcDir', async () => {
    await write('dir/c.md', 'C-content\n')

    const { html } = await render(
      '<!-- @include: @/dir/c.md -->\n',
      {},
      { path: path.join(root, 'sub/index.md') }
    )
    expect(html).toContain('C-content')
  })

  test('resolves @ without a slash against srcDir', async () => {
    await write('dir/c.md', 'C-content\n')

    const { html } = await render(
      '<!-- @include: @dir/c.md -->\n',
      {},
      { path: path.join(root, 'sub/index.md') }
    )
    expect(html).toContain('C-content')
  })

  test('resolves relative includes against the real file path', async () => {
    await write('sub/part.md', 'real-content\n')

    const { html } = await render(
      '<!-- @include: ./part.md -->\n',
      {},
      {
        path: path.join(root, 'rewritten/index.md'),
        realPath: path.join(root, 'sub/index.md')
      }
    )
    expect(html).toContain('real-content')
  })

  test.runIf(process.platform === 'win32')(
    'resolves windows-style paths',
    async () => {
      await write('dir/c.md', 'C-content\n')

      const relative = await render('<!-- @include: .\\dir\\c.md -->\n')
      expect(relative.html).toContain('C-content')

      const rooted = await render('<!-- @include: @\\dir\\c.md -->\n')
      expect(rooted.html).toContain('C-content')

      // watched paths are posix-style for includes
      expect(relative.env.includes).toEqual([
        slash(path.join(root, 'dir/c.md'))
      ])
    }
  )

  test('handles CRLF sources', async () => {
    await write('b.md', 'B-content\n')

    const { html } = await render('# A\r\n\r\n<!-- @include: ./b.md -->\r\n')
    expect(html).toContain('B-content')
  })

  test('expands nested includes with relative resolution', async () => {
    await write(
      'sub/inside.md',
      'inside\n\n<!-- @include: ./subsub/deep.md -->\n'
    )
    await write('sub/subsub/deep.md', 'deep-content\n')

    const { html, env } = await render('<!-- @include: ./sub/inside.md -->\n')
    expect(html).toContain('inside')
    expect(html).toContain('deep-content')
    expect(env.includes).toEqual([
      slash(path.join(root, 'sub/inside.md')),
      slash(path.join(root, 'sub/subsub/deep.md'))
    ])
  })

  test('leaves a self-include unexpanded', async () => {
    const src = '# A\n\n<!-- @include: ./index.md -->\n'
    await write('index.md', src)

    const { html } = await render(src)
    expect(html).toContain('@include: ./index.md')
  })

  test('leaves circular includes unexpanded', async () => {
    await write('a.md', 'A-content\n\n<!-- @include: ./b.md -->\n')
    await write('b.md', 'B-content\n\n<!-- @include: ./a.md -->\n')

    const { html } = await render(
      'A-content\n\n<!-- @include: ./b.md -->\n',
      {},
      { path: path.join(root, 'a.md') }
    )
    expect(html).toContain('B-content')
    expect(html).toContain('@include: ./a.md')
  })

  test('expands repeated includes outside the ancestor chain', async () => {
    await write('b.md', 'B-content\n\n<!-- @include: ./d.md -->\n')
    await write('c.md', 'C-content\n\n<!-- @include: ./d.md -->\n')
    await write('d.md', 'D-content\n')

    const { html } = await render(
      '<!-- @include: ./b.md -->\n<!-- @include: ./c.md -->\n'
    )
    expect(html.match(/D-content/g)).toHaveLength(2)
  })

  test('strips frontmatter of whole-file markdown includes', async () => {
    await write('b.md', '---\ntitle: B\n---\n\nB-content\n')

    const { html } = await render('<!-- @include: ./b.md -->\n')
    expect(html).toContain('B-content')
    expect(html).not.toContain('title: B')
  })

  test('keeps frontmatter lines in range-only includes', async () => {
    await write('b.md', '---\ntitle: B\n---\nline-4\nline-5\n')

    const { html } = await render('<!-- @include: ./b.md{4,4} -->\n')
    expect(html).toContain('line-4')
    expect(html).not.toContain('line-5')
  })

  test('includes regions and strips frontmatter before locating them', async () => {
    await write(
      'b.md',
      [
        '---',
        'title: B',
        '---',
        '<!-- #region part -->',
        'region-content',
        '<!-- #endregion part -->',
        'outside-content',
        ''
      ].join('\n')
    )

    const { html } = await render('<!-- @include: ./b.md#part -->\n')
    expect(html).toContain('region-content')
    expect(html).not.toContain('outside-content')
  })

  test('concatenates all regions with the requested name', async () => {
    await write(
      'b.md',
      [
        '<!-- #region part -->',
        'first',
        '<!-- #endregion part -->',
        'outside',
        '<!-- #region part -->',
        'second',
        '<!-- #endregion -->',
        ''
      ].join('\n')
    )

    const { html } = await render('<!-- @include: ./b.md#part -->\n')
    expect(html).toContain('first')
    expect(html).toContain('second')
    expect(html).not.toContain('outside')
  })

  test('applies ranges within the extracted region', async () => {
    await write(
      'b.md',
      [
        '<!-- #region part -->',
        'one',
        'two',
        'three',
        '<!-- #endregion part -->',
        ''
      ].join('\n')
    )

    const { html } = await render('<!-- @include: ./b.md#part{2,2} -->\n')
    expect(html).toContain('two')
    expect(html).not.toContain('one')
    expect(html).not.toContain('three')
  })

  test('supports ranges with open ends', async () => {
    await write('b.md', 'one\ntwo\nthree\n')

    const from = await render('<!-- @include: ./b.md{2,} -->\n')
    expect(from.html).toContain('two')
    expect(from.html).toContain('three')
    expect(from.html).not.toContain('one')

    const to = await render('<!-- @include: ./b.md{,2} -->\n')
    expect(to.html).toContain('one')
    expect(to.html).toContain('two')
    expect(to.html).not.toContain('three')

    const both = await render('<!-- @include: ./b.md{2,3} -->\n')
    expect(both.html).toContain('two')
    expect(both.html).toContain('three')
    expect(both.html).not.toContain('one')
  })

  test('includes heading sections by anchor', async () => {
    await write(
      'source.md',
      [
        '---',
        'description: Source description',
        '---',
        '# Intro',
        '',
        'intro text',
        '',
        '## Shared',
        '',
        'shared before target',
        '',
        '## Target',
        '',
        'target text',
        '',
        '### Child',
        '',
        'child text',
        '',
        '## Shared',
        '',
        'shared after target',
        ''
      ].join('\n')
    )

    const { html } = await render('<!-- @include: ./source.md#target -->\n')
    expect(html).toContain('target text')
    expect(html).toContain('child text')
    expect(html).not.toContain('Source description')
    expect(html).not.toContain('intro text')
    expect(html).not.toContain('shared before target')
    expect(html).not.toContain('shared after target')
  })

  test('includes heading sections with custom ids up to EOF', async () => {
    await write(
      'source.md',
      ['## My Section {#custom-id}', '', 'section text', ''].join('\n')
    )

    const { html } = await render('<!-- @include: ./source.md#custom-id -->\n')
    expect(html).toContain('section text')
  })

  test('includes non-markdown files verbatim, also inside fences', async () => {
    await write('code.ts', 'const a = 1\nconst b = 2\nconst c = 3\n')

    const fenced = await render(
      '```ts\n<!-- @include: ./code.ts{2,3} -->\n```\n'
    )
    expect(fenced.html).toContain('language-ts')
    expect(fenced.html).toContain('const b = 2')
    expect(fenced.html).toContain('const c = 3')
    expect(fenced.html).not.toContain('const a = 1')
  })

  test('includes regions of non-markdown files', async () => {
    await write(
      'code.ts',
      [
        '// #region part',
        'region line',
        '// #endregion part',
        'outside line',
        ''
      ].join('\n')
    )

    const { html } = await render(
      '```ts\n<!-- @include: ./code.ts#part -->\n```\n'
    )
    expect(html).toContain('region line')
    expect(html).not.toContain('outside line')
  })

  test('leaves empty include paths untouched', async () => {
    const { html } = await render('<!-- @include: -->\n')
    expect(html).toContain('@include:')
  })

  test('skips expansion without a file path in env', async () => {
    disposeMdItInstance()
    const md = await createMarkdownRenderer(
      root,
      { highlight: (code) => code },
      '/',
      logger
    )
    const html = await md.renderAsync('<!-- @include: ./b.md -->\n')
    expect(html).toContain('@include: ./b.md')
  })

  test('can be disabled', async () => {
    await write('b.md', 'B-content\n')

    const { html } = await render('<!-- @include: ./b.md -->\n', {
      include: false
    })
    expect(html).not.toContain('B-content')
    expect(html).toContain('@include: ./b.md')
  })

  test('throws when the file is missing, recording it as a dependency', async () => {
    const env: MarkdownEnv = {
      path: path.join(root, 'index.md'),
      relativePath: 'index.md',
      cleanUrls: false,
      includes: []
    }
    disposeMdItInstance()
    const md = await createMarkdownRenderer(
      root,
      { highlight: (code) => code },
      '/',
      logger
    )
    await expect(
      md.renderAsync('<!-- @include: ./missing.md -->\n', env)
    ).rejects.toThrow(/Include file not found/)
    // the missing file is watched so that creating it recovers the page
    expect(env.includes).toEqual([slash(path.join(root, 'missing.md'))])
  })

  test('throws when neither region nor heading matches', async () => {
    await write('b.md', '## Some Heading\n\ncontent\n')

    await expect(render('<!-- @include: ./b.md#nope -->\n')).rejects.toThrow(
      /region or heading "nope" not found/i
    )
  })

  test('throws when the range is out of bounds', async () => {
    await write('b.md', 'one\ntwo\nthree\n')

    await expect(render('<!-- @include: ./b.md{10,20} -->\n')).rejects.toThrow(
      /range/i
    )
    await expect(render('<!-- @include: ./b.md{3,1} -->\n')).rejects.toThrow(
      /range/i
    )
    await expect(render('<!-- @include: ./b.md{0,2} -->\n')).rejects.toThrow(
      /range/i
    )
  })

  test('silent mode renders nothing on errors and warns', async () => {
    await write('b.md', 'one\ntwo\n')

    const missing = await render(
      'before\n\n<!-- @include: ./missing.md -->\n\nafter\n',
      { include: { silent: true } }
    )
    expect(missing.html).toContain('before')
    expect(missing.html).toContain('after')
    expect(missing.html).not.toContain('@include')

    const region = await render('<!-- @include: ./b.md#nope -->\n', {
      include: { silent: true }
    })
    expect(region.html).not.toContain('@include')

    const range = await render('<!-- @include: ./b.md{5,9} -->\n', {
      include: { silent: true }
    })
    expect(range.html).not.toContain('@include')

    expect(warnings).toHaveLength(3)
    expect(warnings[0]).toContain('missing.md')
    expect(warnings[1]).toContain('nope')
    expect(warnings[2]).toContain('b.md')
  })

  test('keeps relative urls as is with rebaseRelativeUrls: false', async () => {
    await write('sub/part.md', '![img](./img.png)\n\n[link](./target.md)\n')

    const { html } = await render('<!-- @include: ./sub/part.md -->\n', {
      include: { rebaseRelativeUrls: false }
    })
    expect(html).toContain('src="./img.png"')
    expect(html).toContain('href="./target.html"')
    expect(html).not.toContain('@include-')
  })

  test('rebases relative urls inside included files by default', async () => {
    await write('sub/part.md', '![img](./img.png)\n\n[link](./target.md)\n')

    const { html } = await render(
      '<!-- @include: ./sub/part.md -->\n\n[after](./after.md)\n'
    )
    expect(html).toContain('src="./sub/img.png"')
    expect(html).toContain('href="./sub/target.html"')
    // links outside the included content are unaffected
    expect(html).toContain('href="./after.html"')
    // the internal markers never reach the output
    expect(html).not.toContain('@include')
  })

  test('rebases urls through nested includes', async () => {
    await write(
      'a/one.md',
      'one\n\n<!-- @include: ../b/two.md -->\n\n![oneimg](./one.png)\n'
    )
    await write('b/two.md', '![twoimg](./two.png)\n')

    const { html } = await render('<!-- @include: ./a/one.md -->\n')
    expect(html).toContain('src="./b/two.png"')
    expect(html).toContain('src="./a/one.png"')
  })

  test('rebases urls after an include ending with an html block', async () => {
    await write(
      'sub/part.md',
      '![inside](./inside.png)\n\n<div class="card">\ntail\n</div>\n'
    )

    const { html } = await render(
      '<!-- @include: ./sub/part.md -->\n\n![after](./after.png)\n\n[after](./after.md)\n'
    )
    expect(html).toContain('src="./sub/inside.png"')
    // the stack must be popped even though the marker follows an html block
    expect(html).toContain('src="./after.png"')
    expect(html).toContain('href="./after.html"')
    expect(html).not.toContain('@include-')
  })

  test('does not leak rebase markers into fenced includes', async () => {
    await write('sub/part.md', 'partial line\n')

    const { html } = await render(
      '```md\n<!-- @include: ./sub/part.md -->\n```\n'
    )
    expect(html).toContain('partial line')
    expect(html).not.toContain('@include-')
  })

  test('does not leak rebase markers for inline includes', async () => {
    await write('sub/part.md', 'partial line\n')

    const { html } = await render(
      'before <!-- @include: ./sub/part.md --> after\n\n[link](./x.md)\n'
    )
    expect(html).toContain('partial line')
    expect(html).not.toContain('@include-')
    // an inline include leaves the surrounding page urls untouched
    expect(html).toContain('href="./x.html"')
  })

  test('does not rebase absolute or external urls', async () => {
    await write(
      'sub/part.md',
      '[ext](https://example.com/x)\n\n[abs](/abs/target.md)\n'
    )

    const { html } = await render('<!-- @include: ./sub/part.md -->\n')
    expect(html).toContain('href="https://example.com/x"')
    expect(html).toContain('href="/abs/target.html"')
  })
})
