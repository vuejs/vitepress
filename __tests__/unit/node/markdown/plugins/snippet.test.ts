import {
  dedent,
  findRegions,
  rawPathToToken,
  stripMarkers
} from 'node/markdown/plugins/snippet'

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
  ['/path/to/.extension', { filepath: '/path/to/.extension', extension: 'extension', title: '.extension' }],
  ['/path/.to/file.extension', { filepath: '/path/.to/file.extension', extension: 'extension', title: 'file.extension' }],
  ['/path/.to/.extension', { filepath: '/path/.to/.extension', extension: 'extension', title: '.extension' }],
  ['/path/.to/file', { filepath: '/path/.to/file', title: 'file' }],
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
        dedent([
          //
          'fn main() {',
          '  println!("Hello");',
          '}'
        ]).join('\n')
      ).toMatchInlineSnapshot(`
        "fn main() {
          println!("Hello");
        }"
      `)
    })

    test('when 4-level is minimal, remove 4 spaces', () => {
      expect(
        dedent([
          //
          '    let a = {',
          '        value: 42',
          '    };'
        ]).join('\n')
      ).toMatchInlineSnapshot(`
        "let a = {
            value: 42
        };"
      `)
    })

    test('when only 1 line is passed, dedent it', () => {
      expect(
        dedent([
          //
          '    let a = 42;'
        ]).join('\n')
      ).toEqual('let a = 42;')
    })

    test('handle tabs as well', () => {
      expect(
        dedent([
          //
          '	let a = {',
          '		value: 42',
          '	};'
        ]).join('\n')
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

  describe('findRegions', () => {
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
      expect(findRegions(lines, 'region')).toHaveLength(0)
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

    it('detects shell/config style region markers', () => {
      const lines = [
        'echo "before"',
        '# region hello',
        'echo "inside"',
        '#\tendregion hello',
        'echo "after"',
        '#region hello',
        'exit 0',
        '#endregion'
      ]
      const result = findRegions(lines, 'hello')
      expect(result).toHaveLength(2)
      const extracted = result
        .flatMap((r) =>
          lines
            .slice(r.start, r.end)
            .filter((l) => !(r.re.start.test(l) || r.re.end.test(l)))
        )
        .join('\n')
      const expected = [
        //
        'echo "inside"',
        'exit 0'
      ].join('\n')
      expect(extracted).toBe(expected)
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
      expect(
        result
          .flatMap((r) =>
            lines
              .slice(r.start, r.end)
              .filter((l) => !(r.re.start.test(l) || r.re.end.test(l)))
          )
          .join('\n')
      ).toBe('Console.WriteLine("Hello, World!");')
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
      expect(
        result
          .flatMap((r) =>
            lines
              .slice(r.start, r.end)
              .filter((l) => !(r.re.start.test(l) || r.re.end.test(l)))
          )
          .join('\n')
      ).toBe('  Console.WriteLine("Hello, World!");')
    })

    it('detects TypeScript style region markers', () => {
      const lines = [
        'let regexp: RegExp[] = [];',
        '// #region hello',
        'let start = -1;',
        '//#endregion hello'
      ]
      const result = findRegions(lines, 'hello')
      expect(result).toHaveLength(1)
      expect(
        result
          .flatMap((r) =>
            lines
              .slice(r.start, r.end)
              .filter((l) => !(r.re.start.test(l) || r.re.end.test(l)))
          )
          .join('\n')
      ).toBe('let start = -1;')
    })

    it('detects CSS style region markers', () => {
      const lines = [
        '.body-content {',
        '/* #region hello */',
        '  padding-left: 15px;',
        '/*#endregion hello*/',
        '  padding-right: 15px;',
        '}'
      ]
      const result = findRegions(lines, 'hello')
      expect(result).toHaveLength(1)
      expect(
        result
          .flatMap((r) =>
            lines
              .slice(r.start, r.end)
              .filter((l) => !(r.re.start.test(l) || r.re.end.test(l)))
          )
          .join('\n')
      ).toBe('  padding-left: 15px;')
    })

    it('detects HTML style region markers', () => {
      const lines = [
        '<div>Some content</div>',
        '<!-- #region hello -->',
        '  <h1>Hello world</h1>',
        '<!--#endregion hello-->',
        '<div>Other content</div>'
      ]
      const result = findRegions(lines, 'hello')
      expect(result).toHaveLength(1)
      expect(
        result
          .flatMap((r) =>
            lines
              .slice(r.start, r.end)
              .filter((l) => !(r.re.start.test(l) || r.re.end.test(l)))
          )
          .join('\n')
      ).toBe('  <h1>Hello world</h1>')
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
      expect(
        result
          .flatMap((r) =>
            lines
              .slice(r.start, r.end)
              .filter((l) => !(r.re.start.test(l) || r.re.end.test(l)))
          )
          .join('\n')
      ).toBe('  Console.WriteLine("Inside region")')
    })

    it('detects Bat style region markers', () => {
      const lines = [
        //
        '@REM #region hello',
        '@ECHO OFF',
        '::#endregion hello',
        'echo out',
        'rem #region hello',
        'exit 0',
        'Rem #endregion hello'
      ]
      const result = findRegions(lines, 'hello')
      expect(result).toHaveLength(2)

      const extracted = result
        .flatMap((r) =>
          lines
            .slice(r.start, r.end)
            .filter((l) => !(r.re.start.test(l) || r.re.end.test(l)))
        )
        .join('\n')
      const expected = [
        //
        '@ECHO OFF',
        'exit 0'
      ].join('\n')
      expect(extracted).toBe(expected)
    })

    it('detects C/C++ style region markers using #pragma', () => {
      const lines = [
        '#pragma region hello',
        'int a = 1;',
        '#pragma endregion hello'
      ]
      const result = findRegions(lines, 'hello')
      expect(result).toHaveLength(1)
      expect(
        result
          .flatMap((r) =>
            lines
              .slice(r.start, r.end)
              .filter((l) => !(r.re.start.test(l) || r.re.end.test(l)))
          )
          .join('\n')
      ).toBe('int a = 1;')
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
    })

    it('handles region names with hyphens and special characters', () => {
      const lines = [
        '// #region complex-name_123',
        'const x = 1;',
        '// #endregion complex-name_123'
      ]
      const result = findRegions(lines, 'complex-name_123')
      expect(result).toHaveLength(1)
      const extracted = result
        .flatMap((r) =>
          lines
            .slice(r.start, r.end)
            .filter((l) => !(r.re.start.test(l) || r.re.end.test(l)))
        )
        .join('\n')
      expect(extracted).toBe('const x = 1;')
    })

    it('detects JSON-style region markers with double slash and without trailing comma', () => {
      const lines = [
        '{',
        '  "// #region hello": "",',
        '  "key": true,',
        '  "// #endregion hello": ""',
        '}'
      ]
      const result = findRegions(lines, 'hello')
      expect(result).toHaveLength(1)
      expect(
        result
          .flatMap((r) =>
            lines
              .slice(r.start, r.end)
              .filter((l) => !(r.re.start.test(l) || r.re.end.test(l)))
          )
          .join('\n')
      ).toBe('  "key": true,')
    })

    it('detects multiple JSON-style regions with the same name', () => {
      const lines = [
        '{',
        '  "// #region hello": "",',
        '  "one": true,',
        '  "//#endregion hello": "",',
        '  "two": false,',
        '  "/// #region hello": "",',
        '  "three": true,',
        '  "//// #endregion hello": "",',
        '}'
      ]
      const result = findRegions(lines, 'hello')
      expect(result).toHaveLength(2)
      const extracted = result
        .flatMap((r) =>
          lines
            .slice(r.start, r.end)
            .filter((l) => !(r.re.start.test(l) || r.re.end.test(l)))
        )
        .join('\n')
      const expected = [
        //
        '  "one": true,',
        '  "three": true,'
      ].join('\n')
      expect(extracted).toBe(expected)
    })

    it('merges regions with the same name across different comment styles, in document order', () => {
      const lines = [
        '<template>',
        '  <!-- #region shared -->',
        '  <div>template part</div>',
        '  <!-- #endregion shared -->',
        '</template>',
        '<script>',
        '// #region shared',
        'const scriptPart = true',
        '// #endregion shared',
        '// outside',
        '/* #region shared */',
        'console.log(scriptPart)',
        '/* #endregion shared */',
        '</script>',
        '<style>',
        '/* #region shared */',
        '.style-part {}',
        '/* #endregion shared */',
        '</style>'
      ]
      const result = findRegions(lines, 'shared')
      expect(result).toHaveLength(4)
      const extracted = result
        .flatMap((r) =>
          lines
            .slice(r.start, r.end)
            .filter((l) => !(r.re.start.test(l) || r.re.end.test(l)))
        )
        .join('\n')
      const expected = [
        '  <div>template part</div>',
        'const scriptPart = true',
        'console.log(scriptPart)',
        '.style-part {}'
      ].join('\n')
      expect(extracted).toBe(expected)
    })
  })
})

describe('stripMarkers', () => {
  it('removes all matched marker styles', () => {
    const extracted = stripMarkers([
      '// #region name',
      'const a = 0;',
      '/* #region HELLO */',
      'const b = 0;',
      '//\t#endregion complex_name-123',
      'const c = 0;',
      '/*#endregion*/'
    ]).join('\n')
    const expected = [
      //
      'const a = 0;',
      'const b = 0;',
      'const c = 0;'
    ].join('\n')
    expect(extracted).toBe(expected)
  })

  it('interacts with findRegion to remove all intertwined regions', () => {
    const lines = [
      '// #region foo',
      "console.log('double-slash only');",
      '//#region bar',
      '/* #region foo */',
      "console.log('nestled in both comments');",
      '// #endregion foo',
      '/*#endregion bar*/',
      "console.log('slash-star only');",
      '/* #endregion foo */'
    ]
    const result = findRegions(lines, 'foo')
    expect(result).toHaveLength(2)
    const extracted = result
      .flatMap((r) => lines.slice(r.start, r.end))
      .join('\n')
    const expected = [
      "console.log('double-slash only');",
      '//#region bar',
      '/* #region foo */',
      "console.log('nestled in both comments');",
      "console.log('nestled in both comments');",
      '// #endregion foo',
      '/*#endregion bar*/',
      "console.log('slash-star only');"
    ].join('\n')
    expect(extracted).toBe(expected)

    const strippedExtracted = stripMarkers(extracted.split('\n')).join('\n')
    const strippedExpected = [
      "console.log('double-slash only');",
      "console.log('nestled in both comments');",
      "console.log('nestled in both comments');",
      "console.log('slash-star only');"
    ].join('\n')
    expect(strippedExtracted).toBe(strippedExpected)
  })
})
