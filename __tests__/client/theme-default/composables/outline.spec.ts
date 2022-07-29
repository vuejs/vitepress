import { describe, test, expect } from 'vitest'
import * as outline from 'client/theme-default/composables/outline'

describe('client/theme-default/composables/outline', () => {
  describe('resolveHeader', () => {
    test('levels range', () => {
      expect(
        outline.resolveHeaders(
          [
            {
              level: 2,
              title: 'h2 - 1',
              slug: 'h2-1'
            },
            {
              level: 3,
              title: 'h3 - 1',
              slug: 'h3-1'
            }
          ],
          [2, 3]
        )
      ).toEqual([
        {
          text: 'h2 - 1',
          link: '#h2-1',
          children: [
            {
              text: 'h3 - 1',
              link: '#h3-1'
            }
          ]
        }
      ])
    })

    test('specific level', () => {
      expect(
        outline.resolveHeaders(
          [
            {
              level: 2,
              title: 'h2 - 1',
              slug: 'h2-1'
            },
            {
              level: 3,
              title: 'h3 - 1',
              slug: 'h3-1'
            }
          ],
          2
        )
      ).toEqual([
        {
          text: 'h2 - 1',
          link: '#h2-1'
        }
      ])
    })

    test('complex deep', () => {
      expect(
        outline.resolveHeaders(
          [
            {
              level: 2,
              title: 'h2 - 1',
              slug: 'h2-1'
            },
            {
              level: 3,
              title: 'h3 - 1',
              slug: 'h3-1'
            },
            {
              level: 4,
              title: 'h4 - 1',
              slug: 'h4-1'
            },
            {
              level: 3,
              title: 'h3 - 2',
              slug: 'h3-2'
            },
            {
              level: 4,
              title: 'h4 - 2',
              slug: 'h4-2'
            },
            {
              level: 2,
              title: 'h2 - 2',
              slug: 'h2-2'
            },
            {
              level: 3,
              title: 'h3 - 3',
              slug: 'h3-3'
            },
            {
              level: 4,
              title: 'h4 - 3',
              slug: 'h4-3'
            }
          ],
          'deep'
        )
      ).toEqual([
        {
          text: 'h2 - 1',
          link: '#h2-1',
          children: [
            {
              text: 'h3 - 1',
              link: '#h3-1',
              children: [
                {
                  text: 'h4 - 1',
                  link: '#h4-1'
                }
              ]
            },
            {
              text: 'h3 - 2',
              link: '#h3-2',
              children: [
                {
                  text: 'h4 - 2',
                  link: '#h4-2'
                }
              ]
            }
          ]
        },
        {
          text: 'h2 - 2',
          link: '#h2-2',
          children: [
            {
              text: 'h3 - 3',
              link: '#h3-3',
              children: [
                {
                  text: 'h4 - 3',
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
