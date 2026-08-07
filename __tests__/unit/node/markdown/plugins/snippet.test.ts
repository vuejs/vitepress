import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import {
  createMarkdownRenderer,
  disposeMdItInstance,
  type MarkdownOptions
} from 'node/markdown/markdown'
import { parseSnippetPath } from 'node/markdown/plugins/snippet'
import type { MarkdownEnv } from 'node/shared'

const removeEmptyKeys = <T extends Record<string, unknown>>(obj: T) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== '')
  ) as T
}

/* prettier-ignore */
const parseSnippetPathMap: [string, Partial<{ filepath: string, extension: string, title: string, region: string, lines: string, lang: string, attrs: string }>][] = [
  // paths may contain spaces and dots, and the title defaults to the file name
  ['/path/to/file.extension', { filepath: '/path/to/file.extension', extension: 'extension', title: 'file.extension' }],
  ['./path/to/file.extension', { filepath: './path/to/file.extension', extension: 'extension', title: 'file.extension' }],
  ['/path to/file.extension', { filepath: '/path to/file.extension', extension: 'extension', title: 'file.extension' }],
  ['./path to/file.extension', { filepath: './path to/file.extension', extension: 'extension', title: 'file.extension' }],
  ['/path.to/file.extension', { filepath: '/path.to/file.extension', extension: 'extension', title: 'file.extension' }],
  ['./path.to/file.extension', { filepath: './path.to/file.extension', extension: 'extension', title: 'file.extension' }],
  ['/path .to/file.extension', { filepath: '/path .to/file.extension', extension: 'extension', title: 'file.extension' }],
  ['./path .to/file.extension', { filepath: './path .to/file.extension', extension: 'extension', title: 'file.extension' }],
  ['/path/to/file', { filepath: '/path/to/file', title: 'file' }],
  ['./path/to/file', { filepath: './path/to/file', title: 'file' }],
  ['/path to/file', { filepath: '/path to/file', title: 'file' }],
  ['./path to/file', { filepath: './path to/file', title: 'file' }],
  ['/path.to/file', { filepath: '/path.to/file', title: 'file' }],
  ['./path.to/file', { filepath: './path.to/file', title: 'file' }],
  ['/path .to/file', { filepath: '/path .to/file', title: 'file' }],
  ['./path .to/file', { filepath: './path .to/file', title: 'file' }],
  // the extension comes from the file name, so dots in directories and
  // dotfiles resolve, and it is not lowercased
  ['/path/to/.extension', { filepath: '/path/to/.extension', extension: 'extension', title: '.extension' }],
  ['/path/.to/file.extension', { filepath: '/path/.to/file.extension', extension: 'extension', title: 'file.extension' }],
  ['/path/.to/.extension', { filepath: '/path/.to/.extension', extension: 'extension', title: '.extension' }],
  ['/path/.to/file', { filepath: '/path/.to/file', title: 'file' }],
  ['./script.ps1', { filepath: './script.ps1', extension: 'ps1', title: 'script.ps1' }],
  ['./File.TS', { filepath: './File.TS', extension: 'TS', title: 'File.TS' }],
  // suffixes that are not alphanumeric are not treated as an extension, so
  // the language has to be given explicitly for these
  ['./main.c++', { filepath: './main.c++', title: 'main.c++' }],
  ['./main.c++ {c++}', { filepath: './main.c++', title: 'main.c++', lang: 'c++' }],
  ['@/.vscode/scss.code-snippets', { filepath: '@/.vscode/scss.code-snippets', title: 'scss.code-snippets' }],
  // region names may contain dots, dashes, digits and underscores
  ['/path/to/file.extension#region', { filepath: '/path/to/file.extension', extension: 'extension', title: 'file.extension', region: 'region' }],
  ['./file.ts#my.region', { filepath: './file.ts', extension: 'ts', title: 'file.ts', region: 'my.region' }],
  ['./file.ts#complex-name_123', { filepath: './file.ts', extension: 'ts', title: 'file.ts', region: 'complex-name_123' }],
  // inside the braces: optional highlight lines, then the language override
  // (which may contain special characters), then attributes
  ['./path/to/file.extension {c#}', { filepath: './path/to/file.extension', extension: 'extension', title: 'file.extension', lang: 'c#' }],
  ['./path/to/file {C++}', { filepath: './path/to/file', title: 'file', lang: 'C++' }],
  ['/path to/file.extension {1,2,4-6}', { filepath: '/path to/file.extension', extension: 'extension', title: 'file.extension', lines: '1,2,4-6' }],
  ['/path to/file.extension {1,2,4-6 c#}', { filepath: '/path to/file.extension', extension: 'extension', title: 'file.extension', lines: '1,2,4-6', lang: 'c#' }],
  ['./file.ts{1 ts:line-numbers}', { filepath: './file.ts', extension: 'ts', title: 'file.ts', lines: '1', lang: 'ts:line-numbers' }],
  // everything after the language is kept verbatim, so several attributes and
  // quoted values with spaces reach the fence info
  ['./file.ts{1,2 ts twoslash}', { filepath: './file.ts', extension: 'ts', title: 'file.ts', lines: '1,2', lang: 'ts', attrs: 'twoslash' }],
  ['./file.ts{ts twoslash noext}', { filepath: './file.ts', extension: 'ts', title: 'file.ts', lang: 'ts', attrs: 'twoslash noext' }],
  ['./file.ts{1 ts key="a b" twoslash}', { filepath: './file.ts', extension: 'ts', title: 'file.ts', lines: '1', lang: 'ts', attrs: 'key="a b" twoslash' }],
  // a lone word in the braces is the language, not an attribute
  ['./file.ts{twoslash}', { filepath: './file.ts', extension: 'ts', title: 'file.ts', lang: 'twoslash' }],
  // stray whitespace in the braces is tolerated
  ['./file.ts{ ts twoslash }', { filepath: './file.ts', extension: 'ts', title: 'file.ts', lang: 'ts', attrs: 'twoslash' }],
  ['./file.ts{1, 2}', { filepath: './file.ts', extension: 'ts', title: 'file.ts', lines: '1,2' }],
  ['./file.ts{}', { filepath: './file.ts', extension: 'ts', title: 'file.ts' }],
  // an explicit title overrides the file name and may itself contain brackets
  ['/path.to/file.extension [title]', { filepath: '/path.to/file.extension', extension: 'extension', title: 'title' }],
  ['./path.to/file.extension#region {c#}', { filepath: './path.to/file.extension', extension: 'extension', title: 'file.extension', region: 'region', lang: 'c#' }],
  ['/path/to/file#region {1,2,4-6}', { filepath: '/path/to/file', title: 'file', region: 'region', lines: '1,2,4-6' }],
  ['./path/to/file#region {1,2,4-6 c#}', { filepath: './path/to/file', title: 'file', region: 'region', lines: '1,2,4-6', lang: 'c#' }],
  ['/path to/file {1,2,4-6 c#} [title]', { filepath: '/path to/file', title: 'title', lines: '1,2,4-6', lang: 'c#' }],
  ['./path to/file#region {1,2,4-6 c#} [title]', { filepath: './path to/file', title: 'title', region: 'region', lines: '1,2,4-6', lang: 'c#' }],
  ['./file.ts#region{1,2 ts twoslash} [my title]', { filepath: './file.ts', extension: 'ts', title: 'my title', region: 'region', lines: '1,2', lang: 'ts', attrs: 'twoslash' }],
  ['./snippet.js [title [with brackets]]', { filepath: './snippet.js', extension: 'js', title: 'title [with brackets]' }],
  // the space before the title is optional
  ['./foo.js[custom]', { filepath: './foo.js', extension: 'js', title: 'custom' }],
  ['./demo.js{1,3}[Demo]', { filepath: './demo.js', extension: 'js', title: 'Demo', lines: '1,3' }],
  ['./demo.js#region[Demo]', { filepath: './demo.js', extension: 'js', title: 'Demo', region: 'region' }],
  ['@/src/ExampleMod.java{15-21}[java]', { filepath: '@/src/ExampleMod.java', extension: 'java', title: 'java', lines: '15-21' }],
  // windows-style separators resolve the file name the same way
  ['..\\path to\\file.extension', { filepath: '..\\path to\\file.extension', extension: 'extension', title: 'file.extension' }],
  ['C:\\path\\file.ts#region {1 ts}', { filepath: 'C:\\path\\file.ts', extension: 'ts', title: 'file.ts', region: 'region', lines: '1', lang: 'ts' }]
]

describe('node/markdown/plugins/snippet', () => {
  describe('parseSnippetPath', () => {
    test.each(parseSnippetPathMap)('%s', (rawPath, parsed) => {
      expect(removeEmptyKeys(parseSnippetPath(rawPath))).toEqual(parsed)
    })
  })

  describe('rendering', () => {
    let root: string
    let warnings: string[]

    const logger = {
      warn: (msg: string) => {
        warnings.push(msg)
      }
    }

    beforeEach(async () => {
      root = await mkdtemp(path.join(tmpdir(), 'vitepress-snippet-'))
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

    test('imports a whole file, deriving language and title', async () => {
      await write('snip.ts', 'const a = 1\nconst b = 2\n')

      const { html, env } = await render('<<< ./snip.ts')
      expect(html).toContain('language-ts')
      expect(html).toContain('const a = 1')
      expect(html).toContain('const b = 2')
      expect(env.includes).toEqual([path.join(root, 'snip.ts')])
    })

    test('resolves @ against srcDir', async () => {
      await write('nested/snip.js', 'const nested = 1\n')

      const { html } = await render(
        '<<< @/nested/snip.js',
        {},
        { path: path.join(root, 'sub/dir/index.md') }
      )
      expect(html).toContain('const nested = 1')
    })

    test('resolves @ without a slash against srcDir', async () => {
      await write('nested/snip.js', 'const nested = 1\n')

      const { html } = await render(
        '<<< @nested/snip.js',
        {},
        { path: path.join(root, 'sub/dir/index.md') }
      )
      expect(html).toContain('const nested = 1')
    })

    test('parses a snippet without a space after the marker', async () => {
      await write('snip.ts', 'const a = 1\n')

      const { html } = await render('<<<./snip.ts')
      expect(html).toContain('const a = 1')
    })

    test('does not dedent whole-file imports', async () => {
      await write('indented.ts', '  const a = 1\n  const b = 2\n')

      const { html } = await render('<<< ./indented.ts')
      expect(html).toContain('  const a = 1')
    })

    test('passes attrs to the highlighter and keeps them out of the title', async () => {
      await write('snip.ts', 'const a = 1\nconst b = 2\n')

      const calls: { lang: string; attrs: string }[] = []
      await render('<<< ./snip.ts{1 ts twoslash} [my title]', {
        highlight: (code, lang, attrs) => {
          calls.push({ lang, attrs })
          return code
        }
      })

      expect(calls).toHaveLength(1)
      expect(calls[0].lang).toBe('ts')
      expect(calls[0].attrs).toContain('twoslash')
      expect(calls[0].attrs).toContain('{1}')
      expect(calls[0].attrs).not.toContain('my title')
    })

    test('resolves relative paths against the real file path', async () => {
      await write('sub/snip.js', 'const real = 1\n')

      const { html } = await render(
        '<<< ./snip.js',
        {},
        {
          path: path.join(root, 'rewritten/index.md'),
          realPath: path.join(root, 'sub/index.md')
        }
      )
      expect(html).toContain('const real = 1')
    })

    test('concatenates all regions with the requested name', async () => {
      await write(
        'regions.ts',
        [
          '// #region one',
          'const a = 1',
          '// #endregion one',
          'const outside = 2',
          '// #region one',
          'const b = 3',
          '// #endregion',
          ''
        ].join('\n')
      )

      const { html } = await render('<<< ./regions.ts#one')
      expect(html).toContain('const a = 1')
      expect(html).toContain('const b = 3')
      expect(html).not.toContain('const outside')
    })

    test('dedents extracted regions', async () => {
      await write(
        'indent.ts',
        [
          'function f() {',
          '  // #region inner',
          '  const x = 1',
          '  // #endregion inner',
          '}',
          ''
        ].join('\n')
      )

      const { html } = await render('<<< ./indent.ts#inner')
      expect(html).toContain('const x = 1')
      expect(html).not.toContain('  const x = 1')
    })

    const nested = [
      '// #region outer',
      'let a = 1',
      '// #region nested',
      'let b = 2',
      '// #endregion nested',
      '/* #region css */',
      'let c = 3',
      '/* #endregion css */',
      '// #endregion outer',
      ''
    ].join('\n')

    test('strips markers of the matched style by default', async () => {
      await write('nested.ts', nested)

      const region = await render('<<< ./nested.ts#outer')
      // the double-slash markers matched the region, the css ones did not
      expect(region.html).not.toContain('#region nested')
      expect(region.html).toContain('#region css')
      expect(region.html).toContain('let b = 2')
      expect(region.html).toContain('let c = 3')

      // whole-file imports keep their markers
      const whole = await render('<<< ./nested.ts')
      expect(whole.html).toContain('#region outer')
      expect(whole.html).toContain('let a = 1')
    })

    test('strips every marker style with stripRegionMarkers: all', async () => {
      await write('nested.ts', nested)

      const region = await render('<<< ./nested.ts#outer', {
        snippet: { stripRegionMarkers: 'all' }
      })
      expect(region.html).not.toContain('#region')
      expect(region.html).toContain('let b = 2')

      const whole = await render('<<< ./nested.ts', {
        snippet: { stripRegionMarkers: 'all' }
      })
      expect(whole.html).not.toContain('#region')
      expect(whole.html).toContain('let a = 1')
    })

    test('keeps marker lines with stripRegionMarkers: false', async () => {
      await write('nested.ts', nested)

      const region = await render('<<< ./nested.ts#outer', {
        snippet: { stripRegionMarkers: false }
      })
      expect(region.html).toContain('#region nested')
      expect(region.html).toContain('#region css')
    })

    test('applies lang, highlight lines, attrs and title to the fence', async () => {
      await write('snip.ts', 'const a = 1\nconst b = 2\n')

      const { html } = await render(
        '::: code-group\n\n<<< ./snip.ts{1 js twoslash} [custom title]\n\n:::'
      )
      expect(html).toContain('language-js')
      expect(html).toContain('custom title')
      expect(html).not.toContain('twoslash')
    })

    test('throws when the file is missing', async () => {
      await expect(render('<<< ./missing.ts')).rejects.toThrow(
        /Code snippet path not found/
      )
    })

    test('throws when the path is a directory', async () => {
      await write('dir/file.ts', 'const a = 1\n')
      await expect(render('<<< ./dir')).rejects.toThrow(/directory/)
    })

    test('throws when the region is missing', async () => {
      await write('snip.ts', 'const a = 1\n')
      await expect(render('<<< ./snip.ts#nope')).rejects.toThrow(
        /region "nope" not found/i
      )
    })

    test('silent mode renders nothing and warns', async () => {
      await write('snip.ts', 'const a = 1\n')

      const missingFile = await render('<<< ./missing.ts', {
        snippet: { silent: true }
      })
      expect(missingFile.html).not.toContain('<pre')
      expect(missingFile.env.includes).toEqual([path.join(root, 'missing.ts')])

      const missingRegion = await render('<<< ./snip.ts#nope', {
        snippet: { silent: true }
      })
      expect(missingRegion.html).not.toContain('<pre')

      expect(warnings).toHaveLength(2)
      expect(warnings[0]).toContain('missing.ts')
      expect(warnings[1]).toContain('nope')
    })

    test('escaped and indented markers are not parsed as snippets', async () => {
      const escaped = await render('\\<<< ./snip.ts')
      expect(escaped.html).toContain('&lt;&lt;&lt; ./snip.ts')

      const indented = await render('    <<< ./snip.ts')
      expect(indented.html).toContain('&lt;&lt;&lt; ./snip.ts')
      expect(indented.env.includes).toEqual([])
    })

    test.runIf(process.platform === 'win32')(
      'resolves windows-style paths',
      async () => {
        await write('nested/snip.ts', 'const a = 1\n')

        const relative = await render('<<< .\\nested\\snip.ts')
        expect(relative.html).toContain('const a = 1')

        const rooted = await render('<<< @\\nested\\snip.ts')
        expect(rooted.html).toContain('const a = 1')

        // the watched path stays platform-native for snippets
        expect(relative.env.includes).toEqual([
          path.join(root, 'nested/snip.ts')
        ])
      }
    )

    test('normalizes CRLF in imported files', async () => {
      await write('crlf.ts', 'const a = 1\r\nconst b = 2\r\n')

      const { html } = await render('<<< ./crlf.ts')
      expect(html).toContain('const a = 1\nconst b = 2')
      expect(html).not.toContain('\r')
    })
  })
})
