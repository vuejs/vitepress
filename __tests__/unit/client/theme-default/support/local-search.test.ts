import { loadLocalSearchIndex } from 'client/theme-default/support/local-search'
import MiniSearch from 'minisearch'
import { tokenizeSearchText } from 'shared/shared'

describe('client/theme-default/support/local-search', () => {
  // the index as built by the local search plugin
  const json = JSON.stringify(
    (() => {
      const index = new MiniSearch({
        fields: ['title', 'titles', 'text'],
        storeFields: ['title', 'titles'],
        tokenize: tokenizeSearchText
      })
      index.add({
        id: '/#home',
        title: 'Home',
        titles: [],
        text: '日本語の検索機能を改善する。全文搜索引擎很好用'
      })
      return index
    })()
  )

  test('segments queries like the index was built', () => {
    const index = loadLocalSearchIndex(json)
    expect(index.search('検索機能')).toHaveLength(1)
    expect(index.search('全文搜索')).toHaveLength(1)
    expect(index.search('改善')).toHaveLength(1)
  })

  test('uses the user provided tokenize', () => {
    const index = loadLocalSearchIndex(json, {
      options: { tokenize: (text) => [text] }
    })
    expect(index.search('検索機能')).toEqual([])
  })

  test('keeps the default search options', () => {
    const index = loadLocalSearchIndex(json)
    // `prefix: true`
    expect(index.search('hom')).toHaveLength(1)
    expect(
      loadLocalSearchIndex(json, {
        searchOptions: { prefix: false, fuzzy: false }
      }).search('hom')
    ).toEqual([])
  })
})
