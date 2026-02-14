import {
  dedent,
  findRegions,
  rawPathToToken,
  stripMarkers
} from 'node/markdown/plugins/snippet'
import { expect } from 'vitest'

const removeEmptyKeys = <T extends Record<string, unknown>>(obj: T) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== '')
  ) as T
}

/* prettier-ignore */
const rawPathTokenMap: [string, Partial<{ filepath: string, extension: string, title: string, region: string, lines: string, lang: string }>][] = [
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
  ['/path/to/file.extension#region', { filepath: '/path/to/file.extension', extension: 'extension', title: 'file.extension', region: '#region' }],
  ['./path/to/file.extension {c#}', { filepath: './path/to/file.extension', extension: 'extension', title: 'file.extension', lang: 'c#' }],
  ['/path to/file.extension {1,2,4-6}', { filepath: '/path to/file.extension', extension: 'extension', title: 'file.extension', lines: '1,2,4-6' }],
  ['/path to/file.extension {1,2,4-6 c#}', { filepath: '/path to/file.extension', extension: 'extension', title: 'file.extension', lines: '1,2,4-6', lang: 'c#' }],
  ['/path.to/file.extension [title]', { filepath: '/path.to/file.extension', extension: 'extension', title: 'title' }],
  ['./path.to/file.extension#region {c#}', { filepath: './path.to/file.extension', extension: 'extension', title: 'file.extension', region: '#region', lang: 'c#' }],
  ['/path/to/file#region {1,2,4-6}', { filepath: '/path/to/file', title: 'file', region: '#region', lines: '1,2,4-6' }],
  ['./path/to/file#region {1,2,4-6 c#}', { filepath: './path/to/file', title: 'file', region: '#region', lines: '1,2,4-6', lang: 'c#' }],
  ['/path to/file {1,2,4-6 c#} [title]', { filepath: '/path to/file', title: 'title', lines: '1,2,4-6', lang: 'c#' }],
  ['./path to/file#region {1,2,4-6 c#} [title]', { filepath: './path to/file', title: 'title', region: '#region', lines: '1,2,4-6', lang: 'c#' }],
  ['./path/to/file {C++}', { filepath: './path/to/file', title: 'file', lang: 'C++' }],
]

describe('node/markdown/plugins/snippet', () => {
  describe('dedent', () => {
    test('when 0-level is minimal, do not remove spaces', () => {
      expect(
        dedent(
          [
            //
            'fn main() {',
            '  println!("Hello");',
            '}'
          ].join('\n')
        )
      ).toMatchInlineSnapshot(`
        "fn main() {
          println!("Hello");
        }"
      `)
    })

    test('when 4-level is minimal, remove 4 spaces', () => {
      expect(
        dedent(
          [
            //
            '    let a = {',
            '        value: 42',
            '    };'
          ].join('\n')
        )
      ).toMatchInlineSnapshot(`
        "let a = {
            value: 42
        };"
      `)
    })

    test('when only 1 line is passed, dedent it', () => {
      expect(dedent('    let a = 42;')).toEqual('let a = 42;')
    })

    test('handle tabs as well', () => {
      expect(
        dedent(
          [
            //
            '	let a = {',
            '		value: 42',
            '	};'
          ].join('\n')
        )
      ).toMatchInlineSnapshot(`
        "let a = {
        	value: 42
        };"
      `)
    })

    test('empty string remains empty', () => {
      expect(dedent('')).toBe('')
    })
  })

  describe('rawPathToToken', () => {
    test.each(rawPathTokenMap)('%s', (rawPath, token) => {
      expect(removeEmptyKeys(rawPathToToken(rawPath))).toEqual(token)
    })
  })

  describe('findRegion', () => {
    it('returns empty array when no region markers are present', () => {
      const lines = [
        'function foo() {',
        '  console.log("hello");',
        '  return "foo";',
        '}'
      ]
      expect(findRegions(lines, 'foo')).toHaveLength(0)
    })

    it('ignores non-matching region names', () => {
      const lines = [
        '// #region regionA',
        'some code here',
        '// #endregion regionA'
      ]
      expect(findRegions(lines, 'regionC')).toHaveLength(0)
    })

    it('returns empty array if a region start marker exists without a matching end marker', () => {
      const lines = [
        '// #region missingEnd',
        'console.log("inside region");',
        'console.log("still inside");'
      ]
      expect(findRegions(lines, 'missingEnd')).toHaveLength(0)
    })

    it('returns empty array if an end marker exists without a preceding start marker', () => {
      const lines = [
        '// #endregion ghostRegion',
        'console.log("stray end marker");'
      ]
      expect(findRegions(lines, 'ghostRegion')).toHaveLength(0)
    })

    it('detects C#/JavaScript style region markers with matching tags', () => {
      const lines = [
        'Console.WriteLine("Before region");',
        '#region hello',
        'Console.WriteLine("Hello, World!");',
        '#endregion hello',
        'Console.WriteLine("After region");'
      ]
      const result = findRegions(lines, 'hello')
      expect(result).toHaveLength(1)
      if (result) {
        expect(
          result
            .flatMap((r) =>
              lines
                .slice(r.start, r.end)
                .filter((l) => !(r.re.start.test(l) || r.re.end.test(l)))
            )
            .join('\n')
        ).toBe('Console.WriteLine("Hello, World!");')
      }
    })

    it('detects region markers even when the end marker omits the region name', () => {
      const lines = [
        'Console.WriteLine("Before region");',
        '#region hello',
        'Console.WriteLine("Hello, World!");',
        '#endregion',
        'Console.WriteLine("After region");'
      ]
      const result = findRegions(lines, 'hello')
      expect(result).toHaveLength(1)
      if (result) {
        expect(
          result
            .flatMap((r) =>
              lines
                .slice(r.start, r.end)
                .filter((l) => !(r.re.start.test(l) || r.re.end.test(l)))
            )
            .join('\n')
        ).toBe('Console.WriteLine("Hello, World!");')
      }
    })

    it('handles indented region markers correctly', () => {
      const lines = [
        '  Console.WriteLine("Before region");',
        '  #region hello',
        '  Console.WriteLine("Hello, World!");',
        '  #endregion hello',
        '  Console.WriteLine("After region");'
      ]
      const result = findRegions(lines, 'hello')
      expect(result).toHaveLength(1)
      if (result) {
        expect(
          result
            .flatMap((r) =>
              lines
                .slice(r.start, r.end)
                .filter((l) => !(r.re.start.test(l) || r.re.end.test(l)))
            )
            .join('\n')
        ).toBe('  Console.WriteLine("Hello, World!");')
      }
    })

    it('detects TypeScript style region markers', () => {
      const lines = [
        'let regexp: RegExp[] = [];',
        '// #region hello',
        'let start = -1;',
        '// #endregion hello'
      ]
      const result = findRegions(lines, 'hello')
      expect(result).toHaveLength(1)
      if (result) {
        expect(
          result
            .flatMap((r) =>
              lines
                .slice(r.start, r.end)
                .filter((l) => !(r.re.start.test(l) || r.re.end.test(l)))
            )
            .join('\n')
        ).toBe('let start = -1;')
      }
    })

    it('detects CSS style region markers', () => {
      const lines = [
        '.body-content {',
        '/* #region hello */',
        '  padding-left: 15px;',
        '/* #endregion hello */',
        '  padding-right: 15px;',
        '}'
      ]
      const result = findRegions(lines, 'hello')
      expect(result).toHaveLength(1)
      if (result) {
        expect(
          result
            .flatMap((r) =>
              lines
                .slice(r.start, r.end)
                .filter((l) => !(r.re.start.test(l) || r.re.end.test(l)))
            )
            .join('\n')
        ).toBe('  padding-left: 15px;')
      }
    })

    it('detects HTML style region markers', () => {
      const lines = [
        '<div>Some content</div>',
        '<!-- #region hello -->',
        '  <h1>Hello world</h1>',
        '<!-- #endregion hello -->',
        '<div>Other content</div>'
      ]
      const result = findRegions(lines, 'hello')
      expect(result).toHaveLength(1)
      if (result) {
        expect(
          result
            .flatMap((r) =>
              lines
                .slice(r.start, r.end)
                .filter((l) => !(r.re.start.test(l) || r.re.end.test(l)))
            )
            .join('\n')
        ).toBe('  <h1>Hello world</h1>')
      }
    })

    it('detects Visual Basic style region markers (with case-insensitive "End")', () => {
      const lines = [
        'Console.WriteLine("VB")',
        '#Region hello',
        '  Console.WriteLine("Inside region")',
        '#End Region hello',
        'Console.WriteLine("Done")'
      ]
      const result = findRegions(lines, 'hello')
      expect(result).toHaveLength(1)
      if (result) {
        expect(
          result
            .flatMap((r) =>
              lines
                .slice(r.start, r.end)
                .filter((l) => !(r.re.start.test(l) || r.re.end.test(l)))
            )
            .join('\n')
        ).toBe('  Console.WriteLine("Inside region")')
      }
    })

    it('detects Bat style region markers', () => {
      const lines = ['::#region hello', '@ECHO OFF', 'REM #endregion hello']
      const result = findRegions(lines, 'hello')
      expect(result).toHaveLength(1)
      if (result) {
        expect(
          result
            .flatMap((r) =>
              lines
                .slice(r.start, r.end)
                .filter((l) => !(r.re.start.test(l) || r.re.end.test(l)))
            )
            .join('\n')
        ).toBe('@ECHO OFF')
      }
    })

    it('detects C/C++ style region markers using #pragma', () => {
      const lines = [
        '#pragma region hello',
        'int a = 1;',
        '#pragma endregion hello'
      ]
      const result = findRegions(lines, 'hello')
      expect(result).toHaveLength(1)
      if (result) {
        expect(
          result
            .flatMap((r) =>
              lines
                .slice(r.start, r.end)
                .filter((l) => !(r.re.start.test(l) || r.re.end.test(l)))
            )
            .join('\n')
        ).toBe('int a = 1;')
      }
    })

    it('returns all regions with the same name when multiple exist', () => {
      const lines = [
        '// #region hello',
        'first region content',
        '// #endregion hello',
        'between regions content',
        '// #region hello',
        'second region content',
        '// #endregion',
        'between regions content',
        '// #region hello',
        'third region content',
        '// #endregion hello',
        'below regions content'
      ]
      const result = findRegions(lines, 'hello')
      expect(result).toHaveLength(3)
      if (result) {
        const extracted = result
          .flatMap((r) =>
            lines
              .slice(r.start, r.end)
              .filter((l) => !(r.re.start.test(l) || r.re.end.test(l)))
          )
          .join('\n')
        const expected = [
          'first region content',
          'second region content',
          'third region content'
        ].join('\n')
        expect(extracted).toBe(expected)
      }
    })

    it('handles nested regions with different names properly', () => {
      const lines = [
        '// #region foo',
        "console.log('line before nested');",
        '// #region bar',
        "console.log('nested content');",
        '// #endregion bar',
        '// #endregion foo'
      ]
      const result = findRegions(lines, 'foo')
      expect(result).toHaveLength(1)
      if (result) {
        const extracted = result
          .flatMap((r) =>
            lines
              .slice(r.start, r.end)
              .filter((l) => !(r.re.start.test(l) || r.re.end.test(l)))
          )
          .join('\n')
        const expected = [
          "console.log('line before nested');",
          "console.log('nested content');"
        ].join('\n')
        expect(extracted).toBe(expected)
      }
    })

    it('handles region names with hyphens and special characters', () => {
      const lines = [
        '// #region complex-name_123',
        'const x = 1;',
        '// #endregion complex-name_123'
      ]
      const result = findRegions(lines, 'complex-name_123')
      expect(result).toHaveLength(1)
      if (result) {
        const extracted = result
          .flatMap((r) =>
            lines
              .slice(r.start, r.end)
              .filter((l) => !(r.re.start.test(l) || r.re.end.test(l)))
          )
          .join('\n')
        expect(extracted).toBe('const x = 1;')
      }
    })
  })

  describe('stripRegionMarkers', () => {
    it('removes #region and #endregion lines', () => {
      const src = [
        '// #region A',
        '// #region B',
        'console.log("Hello, World!");',
        '// #endregion B',
        '// #endregion A'
      ]
      expect(stripMarkers(src, true)).toBe('console.log("Hello, World!");')
    })

    it('does not remove any marker if stripRegionMarkers is false', () => {
      const src = [
        '// #region A',
        '// #region B',
        'console.log("Hello, World!");',
        '// #endregion B',
        '// #endregion A'
      ]
      expect(stripMarkers(src, false)).toBe(src.join('\n'))
    })

    it('removes region markers for various syntaxes', () => {
      const src = [
        '<!-- #region html -->',
        '<div>hi</div>',
        '<!-- #endregion html -->',
        '/* #region css */',
        'body {}',
        '/* #endregion css */',
        '#pragma region cpp',
        'int main(){}',
        '#pragma endregion cpp',
        '::#region bat',
        'ECHO ON',
        'REM #endregion bat'
      ]
      const out = stripMarkers(src, true)
      expect(out).not.toContain('#region')
      expect(out).not.toContain('#endregion')
      expect(out).toContain('<div>hi</div>')
      expect(out).toContain('body {}')
      expect(out).toContain('int main(){}')
      expect(out).toContain('ECHO ON')
    })

    it('removes markers even if indented or with extra spaces', () => {
      const src = [
        '   //   #region   spaced  ',
        '\t/* #region */',
        'code();',
        '   // #endregion spaced',
        '/*    #endregion   */'
      ]
      const out = stripMarkers(src, true)
      expect(out.trim()).toBe('code();')
    })
  })
})
