import { mergeHead } from 'shared/shared'

describe('shared/shared', () => {
  test('mergeHead dedupes meta tags regardless of attribute order', () => {
    const result = mergeHead([
      ['meta', { content: 'contentA', name: 'name1' }],
      ['meta', { content: 'contentA', name: 'name2' }],
      ['meta', { name: 'name3', content: 'contentB' }],
      ['meta', { name: 'name4', content: 'contentB' }]
    ])

    expect(result).toEqual([
      ['meta', { content: 'contentA', name: 'name1' }],
      ['meta', { content: 'contentA', name: 'name2' }],
      ['meta', { name: 'name3', content: 'contentB' }],
      ['meta', { name: 'name4', content: 'contentB' }]
    ])
  })
})
