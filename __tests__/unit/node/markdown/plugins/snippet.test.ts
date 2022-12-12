import { dedent } from 'node/markdown/plugins/snippet'

describe('node/markdown/plugins/snippet', () => {
  describe('dedent', () => {
    test("when 0-level is minimal, it doesn't remove spaces", () => {
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

    test('when 4-level is minimal, it removes 4 spaces', () => {
      expect(
        dedent(
          [
            //
            '    let a = {',
            '        Some(42)',
            '    };'
          ].join('\n')
        )
      ).toMatchInlineSnapshot(`
        "let a = {
            Some(42)
        };"
      `)
    })

    test('when the only 1 line is passed, it is de-dented', () => {
      expect(dedent('    let a = 42;')).toEqual('let a = 42;')
    })
  })
})
