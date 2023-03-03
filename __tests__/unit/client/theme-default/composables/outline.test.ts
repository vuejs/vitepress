import { resolveHeaders } from 'client/theme-default/composables/outline'

describe('client/theme-default/composables/outline', () => {
  describe('resolveHeader', () => {
    test('levels range', () => {
      expect(
        resolveHeaders(
          [
            {
              level: 1,
              title: 'h1 - 1',
              link: '#h1-1',
              children: [
                {
                  level: 2,
                  title: 'h2 - 1',
                  link: '#h2-1',
                  children: [
                    {
                      level: 3,
                      title: 'h3 - 1',
                      link: '#h3-1'
                    }
                  ]
                }
              ]
            }
          ],
          [2, 3]
        )
      ).toEqual([
        {
          level: 2,
          title: 'h2 - 1',
          link: '#h2-1',
          children: [
            {
              level: 3,
              title: 'h3 - 1',
              link: '#h3-1'
            }
          ]
        }
      ])
    })

    test('specific level', () => {
      expect(
        resolveHeaders(
          [
            {
              level: 2,
              title: 'h2 - 1',
              link: '#h2-1',
              children: [
                {
                  level: 3,
                  title: 'h3 - 1',
                  link: '#h3-1'
                }
              ]
            }
          ],
          2
        )
      ).toEqual([
        {
          level: 2,
          title: 'h2 - 1',
          link: '#h2-1'
        }
      ])
    })

    test('complex deep', () => {
      expect(
        resolveHeaders(
          [
            {
              level: 2,
              title: 'h2 - 1',
              link: '#h2-1',
              children: [
                {
                  level: 3,
                  title: 'h3 - 1',
                  link: '#h3-1',
                  children: [
                    {
                      level: 4,
                      title: 'h4 - 1',
                      link: '#h4-1'
                    }
                  ]
                },
                {
                  level: 3,
                  title: 'h3 - 2',
                  link: '#h3-2',
                  children: [
                    {
                      level: 4,
                      title: 'h4 - 2',
                      link: '#h4-2'
                    }
                  ]
                }
              ]
            },
            {
              level: 2,
              title: 'h2 - 2',
              link: '#h2-2',
              children: [
                {
                  level: 3,
                  title: 'h3 - 3',
                  link: '#h3-3',
                  children: [
                    {
                      level: 4,
                      title: 'h4 - 3',
                      link: '#h4-3'
                    }
                  ]
                }
              ]
            }
          ],
          'deep'
        )
      ).toEqual([
        {
          level: 2,
          title: 'h2 - 1',
          link: '#h2-1',
          children: [
            {
              level: 3,
              title: 'h3 - 1',
              link: '#h3-1',
              children: [
                {
                  level: 4,
                  title: 'h4 - 1',
                  link: '#h4-1'
                }
              ]
            },
            {
              level: 3,
              title: 'h3 - 2',
              link: '#h3-2',
              children: [
                {
                  level: 4,
                  title: 'h4 - 2',
                  link: '#h4-2'
                }
              ]
            }
          ]
        },
        {
          level: 2,
          title: 'h2 - 2',
          link: '#h2-2',
          children: [
            {
              level: 3,
              title: 'h3 - 3',
              link: '#h3-3',
              children: [
                {
                  level: 4,
                  title: 'h4 - 3',
                  link: '#h4-3'
                }
              ]
            }
          ]
        }
      ])
    })
  })
})
