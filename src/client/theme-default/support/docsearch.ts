import type { DefaultTheme } from 'vitepress/theme'

export type ResolvedDocSearchMode = 'keyword' | 'hybrid' | 'sidePanel'
export type FacetFilter = string | string[]

export interface ValidatedCredentials {
  valid: boolean
  appId?: string
  apiKey?: string
  indexName?: string
}

export function hasKeywordSearch(
  options: Pick<
    DefaultTheme.AlgoliaSearchOptions,
    'appId' | 'apiKey' | 'indexName'
  >
): boolean {
  return Boolean(options.appId && options.apiKey && options.indexName)
}

export function hasAskAi(
  askAi: DefaultTheme.AlgoliaSearchOptions['askAi']
): boolean {
  if (!askAi) return false
  if (typeof askAi === 'string') return askAi.length > 0
  return Boolean(askAi.assistantId)
}

export function resolveDocSearchMode(
  options: Pick<
    DefaultTheme.AlgoliaSearchOptions,
    'mode' | 'appId' | 'apiKey' | 'indexName' | 'askAi'
  >
): ResolvedDocSearchMode {
  if (options.mode === 'sidePanel') return 'sidePanel'
  if (options.mode === 'hybrid') return 'hybrid'

  // auto (default)
  const keyword = hasKeywordSearch(options)
  const askAiEnabled = hasAskAi(options.askAi)
  if (askAiEnabled) return keyword ? 'hybrid' : 'sidePanel'
  return 'keyword'
}

/**
 * Removes existing `lang:` filters and appends `lang:${lang}`.
 * Handles both flat arrays and nested arrays (for OR conditions).
 */
export function mergeLangFacetFilters(
  rawFacetFilters: FacetFilter | FacetFilter[] | undefined,
  lang: string
): FacetFilter[] {
  const input = Array.isArray(rawFacetFilters)
    ? rawFacetFilters
    : rawFacetFilters
      ? [rawFacetFilters]
      : []

  const filtered = input
    .map((filter) => {
      if (Array.isArray(filter)) {
        // Handle nested arrays (OR conditions)
        return filter.filter((f) => !f.startsWith('lang:'))
      }
      return filter
    })
    .filter((filter) => {
      if (typeof filter === 'string') {
        return !filter.startsWith('lang:')
      }
      // Keep nested arrays with remaining filters
      return Array.isArray(filter) && filter.length > 0
    })

  return [...filtered, `lang:${lang}`]
}

/**
 * Validates that required Algolia credentials are present.
 */
export function validateCredentials(
  options: Pick<
    DefaultTheme.AlgoliaSearchOptions,
    'appId' | 'apiKey' | 'indexName'
  >
): ValidatedCredentials {
  const appId = options.appId
  const apiKey = options.apiKey
  const indexName = options.indexName

  return {
    valid: Boolean(appId && apiKey && indexName),
    appId,
    apiKey,
    indexName
  }
}

/**
 * Builds Ask AI configuration from various input formats.
 */
export function buildAskAiConfig(
  askAiProp: NonNullable<DefaultTheme.AlgoliaSearchOptions['askAi']>,
  options: DefaultTheme.AlgoliaSearchOptions,
  lang: string
) {
  const isAskAiString = typeof askAiProp === 'string'

  const askAiSearchParameters =
    !isAskAiString && askAiProp.searchParameters
      ? { ...askAiProp.searchParameters }
      : undefined

  // If Ask AI defines its own facetFilters, merge lang filtering into those.
  // Otherwise, reuse the keyword search facetFilters so Ask AI follows the
  // same language filtering behavior by default.
  const askAiFacetFiltersSource =
    askAiSearchParameters?.facetFilters ??
    options.searchParameters?.facetFilters
  const askAiFacetFilters = mergeLangFacetFilters(askAiFacetFiltersSource, lang)

  const mergedAskAiSearchParameters = {
    ...askAiSearchParameters,
    facetFilters: askAiFacetFilters.length ? askAiFacetFilters : undefined
  }

  const result: Record<string, any> = {
    ...(isAskAiString ? {} : askAiProp),
    indexName: isAskAiString ? options.indexName : askAiProp.indexName,
    apiKey: isAskAiString ? options.apiKey : askAiProp.apiKey,
    appId: isAskAiString ? options.appId : askAiProp.appId,
    assistantId: isAskAiString ? askAiProp : askAiProp.assistantId
  }

  // Keep `searchParameters` undefined unless it has at least one key.
  if (Object.values(mergedAskAiSearchParameters).some((v) => v != null)) {
    result.searchParameters = mergedAskAiSearchParameters
  }

  return result
}
