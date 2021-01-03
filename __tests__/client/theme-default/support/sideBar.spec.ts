import {
  getSideBarConfig,
  getFlatSideBarLinks
} from 'client/theme-default/support/sideBar'

describe('client/theme-default/support/sideBar', () => {
  it('gets the correct sidebar items', () => {
    expect(getSideBarConfig(false, '')).toEqual(false)
    expect(getSideBarConfig('auto', '')).toEqual('auto')

    const sidebar = [{ text: 'Title 01', link: 'title-01' }]
    const expected = [{ text: 'Title 01', link: 'title-01' }]

    expect(getSideBarConfig(sidebar, '')).toEqual(expected)
  })

  it('gets the correct sidebar items from the given path', () => {
    const sidebar = {
      '/guide/': [{ text: 'G', link: 'g' }],
      '/': [{ text: 'R', link: 'r' }]
    }

    expect(getSideBarConfig(sidebar, '/')).toEqual(sidebar['/'])
    expect(getSideBarConfig(sidebar, '/guide/')).toEqual(sidebar['/guide/'])
  })

  it('gets the correct sidebar items with various combination', () => {
    const s = {
      '/guide/': [{ text: 'G', link: 'g' }],
      api: [{ text: 'A', link: 'a' }]
    }

    expect(getSideBarConfig(s, '/guide/')).toEqual(s['/guide/'])
    // no ending slash should not match
    expect(getSideBarConfig(s, '/guide')).not.toEqual(s['/guide/'])
    expect(getSideBarConfig(s, 'guide/')).toEqual(s['/guide/'])
    expect(getSideBarConfig(s, 'guide/nested')).toEqual(s['/guide/'])
    expect(getSideBarConfig(s, '/guide/nested')).toEqual(s['/guide/'])
    expect(getSideBarConfig(s, 'guide/nested/')).toEqual(s['/guide/'])
    expect(getSideBarConfig(s, '/api/')).toEqual(s['api'])
    expect(getSideBarConfig(s, '/api')).toEqual(s['api'])
    expect(getSideBarConfig(s, 'api/')).toEqual(s['api'])
    expect(getSideBarConfig(s, 'api/nested')).toEqual(s['api'])
    expect(getSideBarConfig(s, '/api/nested')).toEqual(s['api'])
    expect(getSideBarConfig(s, 'api/nested/')).toEqual(s['api'])
    expect(getSideBarConfig(s, '/')).toEqual('auto')
  })

  it('creates flat sidebar links', () => {
    const sidebar = [
      { text: 'Title 01', link: '/title-01' },
      { text: 'Title 02', link: '/title-02' },
      { text: 'Title 03', link: '/title-03' }
    ]

    const expected = [
      { text: 'Title 01', link: '/title-01' },
      { text: 'Title 02', link: '/title-02' },
      { text: 'Title 03', link: '/title-03' }
    ]

    expect(getFlatSideBarLinks(sidebar)).toEqual(expected)
  })

  it('creates flat sidebar links with mixed sidebar group', () => {
    const sidebar = [
      {
        text: 'Title 01',
        link: '/title-01',
        children: [
          { text: 'Children 01', link: '/children-01' },
          { text: 'Children 02', link: '/children-02' }
        ]
      },
      { text: 'Title 02', link: '/title-02' },
      { text: 'Title 03', link: '/title-03' }
    ]

    const expected = [
      { text: 'Title 01', link: '/title-01' },
      { text: 'Children 01', link: '/children-01' },
      { text: 'Children 02', link: '/children-02' },
      { text: 'Title 02', link: '/title-02' },
      { text: 'Title 03', link: '/title-03' }
    ]

    expect(getFlatSideBarLinks(sidebar)).toEqual(expected)
  })

  it('ignores any items with no `link` property', () => {
    const sidebar = [
      {
        text: 'Title 01',
        children: [
          { text: 'Children 01', link: '/children-01' },
          { text: 'Children 02', link: '/children-02' }
        ]
      },
      { text: 'Title 02', link: '/title-02' }
    ]

    const expected = [
      { text: 'Children 01', link: '/children-01' },
      { text: 'Children 02', link: '/children-02' },
      { text: 'Title 02', link: '/title-02' }
    ]

    expect(getFlatSideBarLinks(sidebar)).toEqual(expected)
  })

  it('removes `.md` or `.html` extention', () => {
    const sidebar = [
      { text: 'Title 01', link: '/title-01.md' },
      { text: 'Title 02', link: '/title-02.html' }
    ]

    const expected = [
      { text: 'Title 01', link: '/title-01' },
      { text: 'Title 02', link: '/title-02' }
    ]

    expect(getFlatSideBarLinks(sidebar)).toEqual(expected)
  })
})
