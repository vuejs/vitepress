import MiniSearch from 'minisearch'
import type { DefaultTheme } from 'vitepress/theme'

import { tokenizeSearchText } from '../../shared'

/**
 * Loads a serialized local search index with the same options that were used
 * to build it (functions are not serialized) plus the default search options.
 */
export function loadLocalSearchIndex<T = Record<string, any>>(
  json: string,
  miniSearch?: DefaultTheme.MiniSearchOptions
) {
  return MiniSearch.loadJSON<T>(json, {
    fields: ['title', 'titles', 'text'],
    storeFields: ['title', 'titles'],
    tokenize: tokenizeSearchText,
    searchOptions: {
      fuzzy: 0.2,
      prefix: true,
      boost: { title: 4, text: 2, titles: 1 },
      ...miniSearch?.searchOptions
    },
    ...miniSearch?.options
  })
}
