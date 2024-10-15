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

  test('rawPathToToken', () => {
    rawPathTokenMap.forEach(([rawPath, token]) => {
      expect(removeEmptyKeys(rawPathToToken(rawPath))).toEqual(token)
    })
  })

  describe('findRegion', () => {
    test('when c# region with matching tag', () => {
      const lines = `Console.WriteLine("Before region");
#region hello
Console.WriteLine("Hello, World!");
#endregion hello
Console.WriteLine("After region");`.split('\n')
      const result = findRegion(lines, 'hello')

      expect(lines.slice(result?.start, result?.end).join('\n')).toBe(
        'Console.WriteLine("Hello, World!");'
      )
    })
    test('when c# region is not indented with spaces and no matching tag', () => {
      const lines = `Console.WriteLine("Before region");
#region hello
Console.WriteLine("Hello, World!");
#endregion
Console.WriteLine("After region");`.split('\n')
      const result = findRegion(lines, 'hello')

      expect(lines.slice(result?.start, result?.end).join('\n')).toBe(
        'Console.WriteLine("Hello, World!");'
      )
    })
    test('when c# region is indented with spaces and no matching tag', () => {
      const lines = `  Console.WriteLine("Before region");
  #region hello
  Console.WriteLine("Hello, World!");
  #endregion hello
  Console.WriteLine("After region");`.split('\n')
      const result = findRegion(lines, 'hello')

      expect(lines.slice(result?.start, result?.end).join('\n')).toBe(
        '  Console.WriteLine("Hello, World!");'
      )
    })
    test('when c# region with matching tag', () => {
      const lines = `Console.WriteLine("Before region");
#region hello
Console.WriteLine("Hello, World!");
#endregion hello
Console.WriteLine("After region");`.split('\n')
      const result = findRegion(lines, 'hello')

      expect(lines.slice(result?.start, result?.end).join('\n')).toBe(
        'Console.WriteLine("Hello, World!");'
      )
    })
    test('when c# region is not indented with spaces and no matching tag', () => {
      const lines = `Console.WriteLine("Before region");
#region hello
Console.WriteLine("Hello, World!");
#endregion
Console.WriteLine("After region");`.split('\n')
      const result = findRegion(lines, 'hello')

      expect(lines.slice(result?.start, result?.end).join('\n')).toBe(
        'Console.WriteLine("Hello, World!");'
      )
    })

    test('when typescript region has matching tag', () => {
      const lines = `let regexp: RegExp[] = []
// #region foo
let start = -1
// #endregion foo`.split('\n')
      const result = findRegion(lines, 'foo')

      expect(lines.slice(result?.start, result?.end).join('\n')).toBe(
        'let start = -1'
      )
    })
    test('when typescript region is indented with spaces and no matching tag', () => {
      const lines = `  let regexp: RegExp[] = []
  // #region foo
  let start = -1
  // #endregion`.split('\n')
      const result = findRegion(lines, 'foo')

      expect(lines.slice(result?.start, result?.end).join('\n')).toBe(
        '  let start = -1'
      )
    })

    test('when css region has matching tag', () => {
      const lines = `.body-content {
/* #region foo */
  padding-left: 15px;
/* #endregion foo */
  padding-right: 15px;
}`.split('\n')
      const result = findRegion(lines, 'foo')

      expect(lines.slice(result?.start, result?.end).join('\n')).toBe(
        '  padding-left: 15px;'
      )
    })
    test('when css region is indented with spaces and no matching tag', () => {
      const lines = `.body-content {
  /* #region foo */
  padding-left: 15px;
  /* #endregion */
  padding-right: 15px;
}`.split('\n')
      const result = findRegion(lines, 'foo')

      expect(lines.slice(result?.start, result?.end).join('\n')).toBe(
        '  padding-left: 15px;'
      )
    })

    test('when html region has matching tag', () => {
      const lines = `<!-- #region foo -->
  <h1>Hello world</h1>
<!-- #endregion foo -->
  <p>more text</p>`.split('\n')
      const result = findRegion(lines, 'foo')

      expect(lines.slice(result?.start, result?.end).join('\n')).toBe(
        '  <h1>Hello world</h1>'
      )
    })
    test('when html region is indented with spaces and no matching tag', () => {
      const lines = `  <!-- #region foo -->
  <h1>Hello world</h1>
  <!-- #endregion foo -->
  <p>more text</p>`.split('\n')
      const result = findRegion(lines, 'foo')

      expect(lines.slice(result?.start, result?.end).join('\n')).toBe(
        '  <h1>Hello world</h1>'
      )
    })
  })
})
