import {
  dedent,
  findRegions,
  markers,
  stripRegionMarkers
} from 'node/markdown/regions'

const extract = (lines: string[], name: string) =>
  findRegions(lines, name)
    .flatMap((r) => lines.slice(r.start, r.end))
    .join('\n')

describe('node/markdown/regions', () => {
  describe('dedent', () => {
    test('keeps lines when 0-level is minimal', () => {
      expect(dedent(['fn main() {', '  println!("Hello");', '}'])).toEqual([
        'fn main() {',
        '  println!("Hello");',
        '}'
      ])
    })

    test('removes the common minimal indent', () => {
      expect(dedent(['    let a = {', '        value: 42', '    };'])).toEqual([
        'let a = {',
        '    value: 42',
        '};'
      ])
    })

    test('dedents a single line', () => {
      expect(dedent(['    let a = 42;'])).toEqual(['let a = 42;'])
    })

    test('handles tabs', () => {
      expect(dedent(['\tlet a = {', '\t\tvalue: 42', '\t};'])).toEqual([
        'let a = {',
        '\tvalue: 42',
        '};'
      ])
    })

    test('ignores blank lines when computing the minimal indent', () => {
      expect(dedent(['  a', '', '  b'])).toEqual(['a', '', 'b'])
    })

    test('keeps whitespace-only input as is', () => {
      expect(dedent(['', '  '])).toEqual(['', '  '])
    })
  })

  describe('findRegions', () => {
    it('returns no regions without markers', () => {
      const lines = ['function foo() {', '  console.log("hello");', '}']
      expect(findRegions(lines, 'foo')).toHaveLength(0)
    })

    it('ignores non-matching and prefix-matching region names', () => {
      const lines = [
        '// #region regionA',
        'some code here',
        '// #endregion regionA'
      ]
      expect(findRegions(lines, 'regionC')).toHaveLength(0)
      expect(findRegions(lines, 'region')).toHaveLength(0)
    })

    it('returns no regions for a start marker without a matching end', () => {
      const lines = [
        '// #region missingEnd',
        'console.log("inside region");',
        'console.log("still inside");'
      ]
      expect(findRegions(lines, 'missingEnd')).toHaveLength(0)
    })

    it('returns no regions for an end marker without a preceding start', () => {
      const lines = [
        '// #endregion ghostRegion',
        'console.log("stray end marker");'
      ]
      expect(findRegions(lines, 'ghostRegion')).toHaveLength(0)
    })

    it('ignores non-marker lines containing the word region', () => {
      const lines = [
        'const region = "region"',
        '// #region hello',
        'const x = 1',
        '// endregion hello is mentioned here without a comment prefix'
      ]
      expect(findRegions(lines, 'hello')).toHaveLength(0)
    })

    it('detects C#-style markers', () => {
      const lines = [
        'Console.WriteLine("Before region");',
        '#region hello',
        'Console.WriteLine("Hello, World!");',
        '#endregion hello',
        'Console.WriteLine("After region");'
      ]
      expect(extract(lines, 'hello')).toBe(
        'Console.WriteLine("Hello, World!");'
      )
    })

    it('closes a named region with an anonymous end marker', () => {
      const lines = [
        '#region hello',
        'Console.WriteLine("Hello, World!");',
        '#endregion',
        'Console.WriteLine("After region");'
      ]
      expect(extract(lines, 'hello')).toBe(
        'Console.WriteLine("Hello, World!");'
      )
    })

    it('does not close a region with a differently named end marker', () => {
      const lines = [
        '#region hello',
        'Console.WriteLine("Hello, World!");',
        '#endregion world'
      ]
      expect(findRegions(lines, 'hello')).toHaveLength(0)
    })

    it('keeps indentation of indented markers and content', () => {
      const lines = [
        '  #region hello',
        '  Console.WriteLine("Hello, World!");',
        '  #endregion hello'
      ]
      expect(extract(lines, 'hello')).toBe(
        '  Console.WriteLine("Hello, World!");'
      )
    })

    it('detects double-slash markers with and without spacing', () => {
      const lines = [
        'let regexp: RegExp[] = [];',
        '// #region foo',
        'let start = -1;',
        '//#endregion foo'
      ]
      expect(extract(lines, 'foo')).toBe('let start = -1;')
    })

    it('detects hash-less double-slash markers like VS Code', () => {
      const lines = ['// region foo', 'let start = -1;', '// endregion foo']
      expect(extract(lines, 'foo')).toBe('let start = -1;')
    })

    it('detects CSS-style markers', () => {
      const lines = [
        '/* #region foo */',
        '  padding-left: 15px;',
        '/*#endregion foo*/'
      ]
      expect(extract(lines, 'foo')).toBe('  padding-left: 15px;')
    })

    it('detects HTML-style markers, with the hash optional', () => {
      const lines = [
        '<!-- #region foo -->',
        '  <h1>Hello world</h1>',
        '<!--#endregion foo-->',
        '<!-- region bar -->',
        '  <h2>Other</h2>',
        '<!-- endregion bar -->'
      ]
      expect(extract(lines, 'foo')).toBe('  <h1>Hello world</h1>')
      expect(extract(lines, 'bar')).toBe('  <h2>Other</h2>')
    })

    it('detects Visual Basic-style markers', () => {
      const lines = [
        '#Region VBRegion',
        '  Console.WriteLine("Inside region")',
        '#End Region VBRegion'
      ]
      expect(extract(lines, 'VBRegion')).toBe(
        '  Console.WriteLine("Inside region")'
      )
    })

    it('ignores the quotes around a Visual Basic region name', () => {
      const lines = [
        '#Region "Quoted Name"',
        '  Console.WriteLine("Inside region")',
        '#End Region',
        '#Region "Other"',
        '  Console.WriteLine("Other region")',
        '#End Region "Other"'
      ]
      expect(extract(lines, 'Quoted Name')).toBe(
        '  Console.WriteLine("Inside region")'
      )
      expect(extract(lines, 'Other')).toBe(
        '  Console.WriteLine("Other region")'
      )
    })

    it('detects bat-style markers with case-insensitive REM', () => {
      const lines = [
        '@REM #region hello',
        '@ECHO OFF',
        '::#endregion hello',
        'echo out',
        'rem #region hello',
        'exit 0',
        'Rem #endregion hello'
      ]
      expect(extract(lines, 'hello')).toBe('@ECHO OFF\nexit 0')
    })

    it('detects dash-dash markers, which require the hash', () => {
      const lines = [
        '-- #region foo',
        'select 1;',
        '-- #endregion foo',
        '--#region bar',
        'select 2;',
        '--#endregion bar'
      ]
      expect(extract(lines, 'foo')).toBe('select 1;')
      expect(extract(lines, 'bar')).toBe('select 2;')

      // prose comments are not markers
      expect(findRegions(['-- region of interest', 'select 1;'], '')).toEqual(
        []
      )
    })

    it('detects pragma markers, allowing space after the hash', () => {
      const lines = [
        '#pragma region foo',
        'int a = 1;',
        '#pragma endregion foo',
        '# pragma region bar',
        'int b = 2;',
        '# pragma endregion bar'
      ]
      expect(extract(lines, 'foo')).toBe('int a = 1;')
      expect(extract(lines, 'bar')).toBe('int b = 2;')
    })

    it('detects paren-star markers', () => {
      const lines = ['(* #region foo *)', 'let a = 1', '(* #endregion foo *)']
      expect(extract(lines, 'foo')).toBe('let a = 1')
    })

    it('detects shell and python style hash markers', () => {
      const lines = [
        '# region hello',
        'echo "inside"',
        '#\tendregion hello',
        '# #region hello',
        'exit 0',
        '# #endregion'
      ]
      expect(extract(lines, 'hello')).toBe('echo "inside"\nexit 0')
    })

    it('detects JSON key-style markers with two or more slashes', () => {
      const lines = [
        '{',
        '  "// #region hello": "",',
        '  "one": true,',
        '  "//#endregion hello": "",',
        '  "two": false,',
        '  "/// #region hello": "",',
        '  "three": true,',
        '  "//// #endregion hello": ""',
        '}'
      ]
      expect(extract(lines, 'hello')).toBe('  "one": true,\n  "three": true,')
    })

    it('concatenates multiple same-named regions in document order', () => {
      const lines = [
        '// #region hello',
        'first region content',
        '// #endregion hello',
        'other content',
        '// #region hello',
        'second region content',
        '// #endregion',
        '// #region hello',
        'third region content',
        '// #endregion hello'
      ]
      expect(extract(lines, 'hello')).toBe(
        'first region content\nsecond region content\nthird region content'
      )
    })

    it('merges same-named regions across different comment styles', () => {
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
      const regions = findRegions(lines, 'shared')
      expect(regions).toHaveLength(4)
      expect(extract(lines, 'shared')).toBe(
        [
          '  <div>template part</div>',
          'const scriptPart = true',
          'console.log(scriptPart)',
          '.style-part {}'
        ].join('\n')
      )
    })

    it('tracks nesting of same-named regions across styles', () => {
      const lines = [
        '// #region foo',
        "console.log('double-slash only');",
        '/* #region foo */',
        "console.log('nested in both');",
        '// #endregion foo',
        "console.log('still in outer');",
        '/* #endregion foo */',
        "console.log('outside');"
      ]
      const regions = findRegions(lines, 'foo')
      expect(regions).toHaveLength(1)
      expect(regions[0]).toMatchObject({ start: 1, end: 6 })
    })

    it('closes the innermost open region with an anonymous end marker', () => {
      const lines = [
        '<!-- #region demo -->',
        '<template><div /></template>',
        '<script setup>',
        '// #region state',
        'const count = ref(0)',
        '// #endregion',
        'function inc() {}',
        '</script>',
        '<!-- #endregion demo -->'
      ]
      expect(extract(lines, 'demo')).toBe(
        [
          '<template><div /></template>',
          '<script setup>',
          '// #region state',
          'const count = ref(0)',
          '// #endregion',
          'function inc() {}',
          '</script>'
        ].join('\n')
      )
      expect(extract(lines, 'state')).toBe('const count = ref(0)')
    })

    it('is not closed by an anonymous end marker of a nested region in a fence', () => {
      const lines = [
        '<!-- #region sample -->',
        'Use markers like this:',
        '',
        '```js',
        '// #region foo',
        'const a = 1',
        '// #endregion',
        '```',
        '<!-- #endregion sample -->'
      ]
      expect(extract(lines, 'sample')).toBe(
        [
          'Use markers like this:',
          '',
          '```js',
          '// #region foo',
          'const a = 1',
          '// #endregion',
          '```'
        ].join('\n')
      )
    })

    it('is closed by an anonymous end marker of its own style', () => {
      // a region documenting region syntax: the marker inside the fence is
      // never closed, and the anonymous end marker belongs to the region
      const lines = [
        '<!-- #region real -->',
        'How regions work:',
        '',
        '```js',
        '// #region example',
        'const a = 1',
        '```',
        '<!-- #endregion -->'
      ]
      expect(extract(lines, 'real')).toBe(
        [
          'How regions work:',
          '',
          '```js',
          '// #region example',
          'const a = 1',
          '```'
        ].join('\n')
      )
    })

    it('ignores an anonymous end marker with nothing open in its style', () => {
      const lines = [
        '<!-- #region real -->',
        '// #endregion',
        'body',
        '<!-- #endregion -->'
      ]
      expect(extract(lines, 'real')).toBe('// #endregion\nbody')
    })

    it('tolerates an unclosed region nested inside the requested one', () => {
      const lines = [
        '// #region outer',
        'const a = 1',
        '// #region inner',
        'const b = 2',
        '// #endregion outer'
      ]
      expect(extract(lines, 'outer')).toBe(
        ['const a = 1', '// #region inner', 'const b = 2'].join('\n')
      )
    })

    it('keeps differently named nested regions verbatim', () => {
      const lines = [
        '// #region foo',
        "console.log('line before nested');",
        '// #region bar',
        "console.log('nested content');",
        '// #endregion bar',
        '// #endregion foo'
      ]
      expect(extract(lines, 'foo')).toBe(
        [
          "console.log('line before nested');",
          '// #region bar',
          "console.log('nested content');",
          '// #endregion bar'
        ].join('\n')
      )
    })

    it('supports special characters in region names', () => {
      const lines = [
        '// #region complex-name_123',
        'const x = 1;',
        '// #endregion complex-name_123',
        '// #region my.region',
        'const y = 2;',
        '// #endregion my.region'
      ]
      expect(extract(lines, 'complex-name_123')).toBe('const x = 1;')
      expect(extract(lines, 'my.region')).toBe('const y = 2;')
    })

    it('reports the marker style that opened each region', () => {
      const lines = ['// #region foo', 'const x = 1;', '// #endregion foo']
      const [region] = findRegions(lines, 'foo')
      expect(markers).toContain(region.marker)
      expect(region.marker.start.test('// #region other')).toBe(true)
      expect(region.marker.start.test('# region other')).toBe(false)
    })
  })

  describe('stripRegionMarkers', () => {
    it('strips marker lines of every style and name by default', () => {
      const lines = [
        '// #region name',
        'const a = 0;',
        '/* #region HELLO */',
        'const b = 0;',
        '//\t#endregion complex_name-123',
        'const c = 0;',
        '/*#endregion*/'
      ]
      expect(stripRegionMarkers(lines)).toEqual([
        'const a = 0;',
        'const b = 0;',
        'const c = 0;'
      ])
    })

    it('keeps non-marker lines mentioning regions', () => {
      const lines = ['const region = "region"', 'let a = 1']
      expect(stripRegionMarkers(lines)).toEqual(lines)
    })

    it('strips only the given marker styles when provided', () => {
      const lines = [
        '// #region a',
        'const x = 1',
        '// #endregion a',
        '# region b',
        'const y = 2',
        '# endregion b'
      ]
      const [region] = findRegions(lines, 'a')
      expect(stripRegionMarkers(lines, [region.marker])).toEqual([
        'const x = 1',
        '# region b',
        'const y = 2',
        '# endregion b'
      ])
    })
  })
})
