import { mergeHead } from 'shared/shared'

describe('shared/shared', () => {
  test('mergeHead uses id as the key regardless of attribute order', () => {
    const result = mergeHead(
      [['meta', { id: 'description', name: 'description', content: 'site' }]],
      [['meta', { content: 'page', name: 'description', id: 'description' }]]
    )

    expect(result).toEqual([
      ['meta', { content: 'page', name: 'description', id: 'description' }]
    ])
  })

  test('mergeHead keeps meta tags with unique ids', () => {
    const result = mergeHead([
      [
        'meta',
        { content: '/preview.png', property: 'og:image', id: 'og-image' }
      ],
      [
        'meta',
        {
          content: '/preview.png',
          property: 'og:image:url',
          id: 'og-image-url'
        }
      ]
    ])

    expect(result).toHaveLength(2)
  })
})
