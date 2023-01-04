import { dedent } from 'node/markdown/plugins/snippet'

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
          println!(\\"Hello\\");
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
})
