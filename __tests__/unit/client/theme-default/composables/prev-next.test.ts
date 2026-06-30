const mockData = vi.hoisted(() => ({
  page: {
    value: {
      relativePath: 'intro.md'
    }
  },
  theme: {
    value: {
      sidebar: [
        {
          items: [
            { text: 'Intro', link: '/intro' },
            {
              text: 'Next',
              link: '/next',
              target: '_self',
              rel: 'nofollow'
            }
          ]
        }
      ]
    }
  },
  frontmatter: {
    value: {}
  }
}))

vi.mock('client/theme-default/composables/data', () => ({
  useData: () => mockData
}))

import { usePrevNext } from 'client/theme-default/composables/prev-next'

describe('client/theme-default/composables/prev-next', () => {
  test('preserves target and rel from sidebar links', () => {
    const control = usePrevNext()

    expect(control.value.next).toMatchObject({
      text: 'Next',
      link: '/next',
      target: '_self',
      rel: 'nofollow'
    })
  })
})
