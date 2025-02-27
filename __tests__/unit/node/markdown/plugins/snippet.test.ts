import {
  dedent,
  findRegion,
  rawPathToToken
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
  })

  describe('rawPathToToken', () => {
    test.each(rawPathTokenMap)('%s', (rawPath, token) => {
      expect(removeEmptyKeys(rawPathToToken(rawPath))).toEqual(token)
    })
  })

  describe('findRegion', () => {
    it('returns null when no region markers are present', () => {
      const lines = ['function foo() {', '  console.log("hello");', '}']
      expect(findRegion(lines, 'foo')).toBeNull()
    })

    it('ignores non-matching region names', () => {
      const lines = [
        '// #region regionA',
        'some code here',
        '// #endregion regionA'
      ]
      expect(findRegion(lines, 'regionC')).toBeNull()
    })

    it('returns null if a region start marker exists without a matching end marker', () => {
      const lines = [
        '// #region missingEnd',
        'console.log("inside region");',
        'console.log("still inside");'
      ]
      expect(findRegion(lines, 'missingEnd')).toBeNull()
    })

    it('returns null if an end marker exists without a preceding start marker', () => {
      const lines = [
        '// #endregion ghostRegion',
        'console.log("stray end marker");'
      ]
      expect(findRegion(lines, 'ghostRegion')).toBeNull()
    })

    it('detects C#/JavaScript style region markers with matching tags', () => {
      const lines = [
        'Console.WriteLine("Before region");',
        '#region hello',
        'Console.WriteLine("Hello, World!");',
        '#endregion hello',
        'Console.WriteLine("After region");'
      ]
      const result = findRegion(lines, 'hello')
      expect(result).not.toBeNull()
      if (result) {
        expect(lines.slice(result.start, result.end).join('\n')).toBe(
          'Console.WriteLine("Hello, World!");'
        )
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
      const result = findRegion(lines, 'hello')
      expect(result).not.toBeNull()
      if (result) {
        expect(lines.slice(result.start, result.end).join('\n')).toBe(
          'Console.WriteLine("Hello, World!");'
        )
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
      const result = findRegion(lines, 'hello')
      expect(result).not.toBeNull()
      if (result) {
        expect(lines.slice(result.start, result.end).join('\n')).toBe(
          '  Console.WriteLine("Hello, World!");'
        )
      }
    })

    it('detects TypeScript style region markers', () => {
      const lines = [
        'let regexp: RegExp[] = [];',
        '// #region foo',
        'let start = -1;',
        '// #endregion foo'
      ]
      const result = findRegion(lines, 'foo')
      expect(result).not.toBeNull()
      if (result) {
        expect(lines.slice(result.start, result.end).join('\n')).toBe(
          'let start = -1;'
        )
      }
    })

    it('detects CSS style region markers', () => {
      const lines = [
        '.body-content {',
        '/* #region foo */',
        '  padding-left: 15px;',
        '/* #endregion foo */',
        '  padding-right: 15px;',
        '}'
      ]
      const result = findRegion(lines, 'foo')
      expect(result).not.toBeNull()
      if (result) {
        expect(lines.slice(result.start, result.end).join('\n')).toBe(
          '  padding-left: 15px;'
        )
      }
    })

    it('detects HTML style region markers', () => {
      const lines = [
        '<div>Some content</div>',
        '<!-- #region foo -->',
        '  <h1>Hello world</h1>',
        '<!-- #endregion foo -->',
        '<div>Other content</div>'
      ]
      const result = findRegion(lines, 'foo')
      expect(result).not.toBeNull()
      if (result) {
        expect(lines.slice(result.start, result.end).join('\n')).toBe(
          '  <h1>Hello world</h1>'
        )
      }
    })

    it('detects Visual Basic style region markers (with case-insensitive "End")', () => {
      const lines = [
        'Console.WriteLine("VB")',
        '#Region VBRegion',
        '  Console.WriteLine("Inside region")',
        '#End Region VBRegion',
        'Console.WriteLine("Done")'
      ]
      const result = findRegion(lines, 'VBRegion')
      expect(result).not.toBeNull()
      if (result) {
        expect(lines.slice(result.start, result.end).join('\n')).toBe(
          '  Console.WriteLine("Inside region")'
        )
      }
    })

    it('detects Bat style region markers', () => {
      const lines = ['::#region foo', 'echo off', '::#endregion foo']
      const result = findRegion(lines, 'foo')
      expect(result).not.toBeNull()
      if (result) {
        expect(lines.slice(result.start, result.end).join('\n')).toBe(
          'echo off'
        )
      }
    })

    it('detects C/C++ style region markers using #pragma', () => {
      const lines = [
        '#pragma region foo',
        'int a = 1;',
        '#pragma endregion foo'
      ]
      const result = findRegion(lines, 'foo')
      expect(result).not.toBeNull()
      if (result) {
        expect(lines.slice(result.start, result.end).join('\n')).toBe(
          'int a = 1;'
        )
      }
    })

    it('returns the first complete region when multiple regions exist', () => {
      const lines = [
        '// #region foo',
        'first region content',
        '// #endregion foo',
        '// #region foo',
        'second region content',
        '// #endregion foo'
      ]
      const result = findRegion(lines, 'foo')
      expect(result).not.toBeNull()
      if (result) {
        expect(lines.slice(result.start, result.end).join('\n')).toBe(
          'first region content'
        )
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
      const result = findRegion(lines, 'foo')
      expect(result).not.toBeNull()
      if (result) {
        const extracted = lines.slice(result.start, result.end).join('\n')
        const expected = [
          "console.log('line before nested');",
          '// #region bar',
          "console.log('nested content');",
          '// #endregion bar'
        ].join('\n')
        expect(extracted).toBe(expected)
      }
    })
  })
})
