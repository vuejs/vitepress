import {
  deserializeFunctions,
  serializeFunctions
} from 'node/utils/fnSerialize'

// runs the exact code shape that plugin.ts / build.ts emit into the site-data
// module and the metadata script — the revived value must come back without
// the deserializer ever compiling a string (new Function is used here only to
// stand in for the browser executing the emitted file)
function emitAndRevive(data: any): any {
  const fns: string[] = []
  const serialized = serializeFunctions(data, fns)
  const script = `${deserializeFunctions};return deserializeFunctions(JSON.parse(${JSON.stringify(
    JSON.stringify(serialized)
  )}),[${fns.join(',')}])`
  return new Function(script)()
}

describe('node/utils/fnSerialize', () => {
  test('emitted deserializer does not rely on unsafe-eval', () => {
    expect(deserializeFunctions).not.toContain('new Function')
    expect(deserializeFunctions).not.toContain('eval')
  })

  test('serializes functions as indexed markers', () => {
    const fns: string[] = []
    const serialized = serializeFunctions(
      { a: (x: number) => x, b: { c: (x: number) => x * 2 } },
      fns
    )
    expect(serialized).toEqual({ a: '_vp-fn_0', b: { c: '_vp-fn_1' } })
    expect(fns).toHaveLength(2)
  })

  test('revives functions nested in objects and arrays', () => {
    const data = {
      search: {
        options: {
          miniSearch: {
            options: {
              tokenize: (text: string) => text.split(/\s+/)
            },
            searchOptions: {
              boostDocument: (id: string) => (id === 'index.md' ? 2 : 1)
            }
          }
        }
      },
      list: [(n: number) => n + 1, 'plain', 42]
    }

    const revived = emitAndRevive(data)

    expect(revived.search.options.miniSearch.options.tokenize('a b')).toEqual([
      'a',
      'b'
    ])
    expect(
      revived.search.options.miniSearch.searchOptions.boostDocument('index.md')
    ).toBe(2)
    expect(revived.list[0](1)).toBe(2)
    expect(revived.list[1]).toBe('plain')
    expect(revived.list[2]).toBe(42)
  })

  test('revives method shorthand and async functions', () => {
    const data = {
      tokenize(text: string) {
        return text.toUpperCase()
      },
      async extractField(doc: { id: string }) {
        return doc.id
      }
    }

    const revived = emitAndRevive(data)

    expect(revived.tokenize('abc')).toBe('ABC')
    return expect(revived.extractField({ id: 'x' })).resolves.toBe('x')
  })

  test('drops underscore-prefixed keys', () => {
    const revived = emitAndRevive({ _render: () => '', keep: 1 })
    expect(revived).toEqual({ keep: 1 })
  })

  test('leaves data strings resembling markers untouched', () => {
    const data = {
      fn: (x: number) => x,
      note: '_vp-fn_alert(1)'
    }

    const revived = emitAndRevive(data)

    expect(revived.fn(1)).toBe(1)
    expect(revived.note).toBe('_vp-fn_alert(1)')
  })
})
