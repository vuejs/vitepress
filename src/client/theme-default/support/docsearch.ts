import type { SidepanelProps } from '@docsearch/sidepanel-js'
import type { DefaultTheme } from 'vitepress/theme'

import type { DocSearchAskAi } from '../../../../types/docsearch'
import { isObject } from '../../shared'

export type FacetFilter = string | string[] | FacetFilter[]

export interface ValidatedCredentials {
  valid: boolean
  appId?: string
  apiKey?: string
  indices?: DefaultTheme.AlgoliaSearchOptions['indices']
}

export type DocSearchMode = 'auto' | 'sidePanel' | 'hybrid' | 'modal'

export interface ResolvedMode {
  mode: DocSearchMode
  showKeywordSearch: boolean
  useSidePanel: boolean
}

/**
 * Resolves the effective mode based on config and available features.
 *
 * - 'auto': infer hybrid vs sidePanel-only from provided config
 * - 'sidePanel': force sidePanel-only even if keyword search is configured
 * - 'hybrid': force hybrid (error if keyword search is not configured)
 * - 'modal': force modal even if sidePanel is configured
 */
export function resolveMode(
  options: Pick<
    DefaultTheme.AlgoliaSearchOptions,
    'appId' | 'apiKey' | 'indices' | 'askAi' | 'mode'
  >
): ResolvedMode {
  const mode = options.mode ?? 'auto'
  const hasKeyword = hasKeywordSearch(options)
  const askAi = options.askAi
  const hasSidePanelConfig = Boolean(
    askAi && typeof askAi === 'object' && askAi.sidePanel
  )

  switch (mode) {
    case 'sidePanel':
      // Force sidePanel-only - hide keyword search
      return {
        mode,
        showKeywordSearch: false,
        useSidePanel: true
      }

    case 'hybrid':
      // Force hybrid - keyword search must be configured
      if (!hasKeyword) {
        console.error(
          '[vitepress] mode: "hybrid" requires keyword search credentials (appId, apiKey, indices).'
        )
      }
      return {
        mode,
        showKeywordSearch: hasKeyword,
        useSidePanel: true
      }

    case 'modal':
      // Force modal - don't use sidepanel for askai, even if configured
      return {
        mode,
        showKeywordSearch: hasKeyword,
        useSidePanel: false
      }

    case 'auto':
    default:
      // Auto-detect based on config
      return {
        mode: 'auto',
        showKeywordSearch: hasKeyword,
        useSidePanel: hasSidePanelConfig
      }
  }
}

export function hasKeywordSearch(
  options: Pick<
    DefaultTheme.AlgoliaSearchOptions,
    'appId' | 'apiKey' | 'indices'
  >
): boolean {
  return Boolean(
    options.appId &&
    options.apiKey &&
    options.indices &&
    options.indices.length > 0
  )
}

export function hasAskAi(
  askAi: DefaultTheme.AlgoliaSearchOptions['askAi']
): boolean {
  if (!askAi) return false
  if (typeof askAi === 'string') return askAi.length > 0
  return Boolean(askAi.agentId)
}

const LANG_FILTER_REGEXP =
  /"(?:\\.|[^"\\])*"|(^|[\s(])((?:NOT\s+)?lang:(?:"(?:\\.|[^"\\])*"|[^\s()]+))/gi

/**
 * Normalizes existing positive `lang:` filters and applies `lang:${lang}` to
 * the complete expression.
 */
export function mergeLangFilters(
  existing: string | undefined,
  lang: string
): string {
  const langFilter = `lang:${lang}`

  if (!existing) {
    return langFilter
  }

  const normalized = existing.replace(
    LANG_FILTER_REGEXP,
    (match, prefix, predicate) => {
      if (!predicate) {
        return match
      }

      if (/^NOT\b/i.test(predicate)) return match

      return `${prefix ?? ''}${langFilter}`
    }
  )

  return `(${normalized}) AND ${langFilter}`
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
        return filter.filter(
          (f) => typeof f === 'string' && !f.startsWith('lang:')
        )
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

type CredentialOptions = Pick<
  DefaultTheme.AlgoliaSearchOptions,
  'appId' | 'apiKey' | 'indices' | 'mode' | 'askAi'
>

/**
 * Validates that required Algolia credentials are present.
 */
export function validateCredentials(
  options: CredentialOptions
): ValidatedCredentials {
  const appId = options.appId
  const apiKey = options.apiKey
  const indices = options.indices
  const askAiConfigured = options.askAi !== undefined
  const hasValidAskAi = hasAskAi(options.askAi)
  const mode = options.mode || 'auto'
  const hasSidepanel =
    typeof options.askAi === 'object' && Boolean(options.askAi.sidePanel)
  const requiresSidepanel = mode === 'sidePanel' || mode === 'hybrid'
  const canOmitIndices =
    mode === 'sidePanel' || (mode === 'auto' && hasSidepanel)

  let isValid = true

  if (askAiConfigured && !hasValidAskAi) {
    isValid = false
  }

  if (requiresSidepanel && !hasSidepanel) {
    isValid = false
  }

  // Sidepanel only (or auto mode with sidepanel) does not require `indices` since there could be no search
  if (!canOmitIndices && !indices?.length) {
    isValid = false
  }

  if (!appId || !apiKey) {
    isValid = false
  }

  return {
    valid: isValid,
    appId,
    apiKey,
    indices
  }
}

/**
 * Builds Ask AI configuration from various input formats.
 */
export function buildAskAiConfig(
  askAiProp: NonNullable<DefaultTheme.AlgoliaSearchOptions['askAi']>,
  options: DefaultTheme.AlgoliaSearchOptions,
  lang: string
): DocSearchAskAi {
  const isAskAiString = typeof askAiProp === 'string'

  let askAiSearchParameters: DocSearchAskAi['searchParameters']

  if (!isAskAiString) {
    const mergedSearchParameters: NonNullable<
      DocSearchAskAi['searchParameters']
    > = {}

    const indexes = new Set([
      ...(askAiProp.indices ?? []),
      ...Object.keys(askAiProp.searchParameters ?? {})
    ])

    for (const indexName of indexes) {
      const searchParameters = askAiProp.searchParameters?.[indexName] ?? {}

      mergedSearchParameters[indexName] = {
        ...searchParameters,
        filters: mergeLangFilters(searchParameters.filters, lang)
      }
    }

    if (indexes.size > 0) {
      askAiSearchParameters = mergedSearchParameters
    }
  }

  const result: Record<string, any> = {
    ...(isAskAiString ? {} : askAiProp),
    apiKey: isAskAiString ? options.apiKey : askAiProp.apiKey,
    appId: isAskAiString ? options.appId : askAiProp.appId,
    agentId: isAskAiString ? askAiProp : askAiProp.agentId
  }

  // Keep `searchParameters` undefined unless it has at least one key.
  if (
    askAiSearchParameters &&
    Object.values(askAiSearchParameters).some((v) => v != null)
  ) {
    result.searchParameters = askAiSearchParameters
  }

  return result
}

/**
 * Builds the DocSearch side panel config from the resolved Ask AI options.
 */
export function buildSidePanelProps(
  askAi: DocSearchAskAi,
  options: DefaultTheme.AlgoliaSearchOptions
): SidepanelProps {
  const { sidePanel, ...askAiRest } = JSON.parse(
    JSON.stringify(askAi)
  ) as DocSearchAskAi

  return {
    container: '#vp-docsearch-sidepanel',
    appId: options.appId,
    apiKey: options.apiKey,
    ...askAiRest,
    ...(sidePanel && sidePanel !== true ? sidePanel : {})
  } as SidepanelProps
}

/**
 * Resolves Algolia search options for the given language,
 * merging in locale-specific overrides and language facet filters.
 */
export function resolveOptionsForLanguage(
  options: DefaultTheme.AlgoliaSearchOptions,
  localeIndex: string,
  lang: string
): DefaultTheme.AlgoliaSearchOptions {
  options = deepMerge(options, options.locales?.[localeIndex] || {})

  const indices = (options.indices ?? []).map((index) => {
    if (typeof index === 'string') {
      return {
        name: index,
        searchParameters: { facetFilters: [`lang:${lang}`] }
      }
    }

    return {
      name: index.name,
      searchParameters: {
        ...index.searchParameters,
        facetFilters: mergeLangFacetFilters(
          index.searchParameters?.facetFilters,
          lang
        )
      }
    }
  })

  const askAi = options.askAi
    ? buildAskAiConfig(options.askAi, options, lang)
    : undefined

  return {
    ...options,
    indices,
    askAi
  }
}

function deepMerge<T>(target: T, source: Partial<T>): T {
  const result = { ...target } as any

  for (const key in source) {
    const value = source[key]
    if (value === undefined) continue

    // special case: replace entirely
    if (key === 'searchParameters') {
      result[key] = value
      continue
    }

    // deep-merge only plain objects; arrays are replaced entirely
    if (isObject(value) && isObject(result[key])) {
      result[key] = deepMerge(result[key], value)
    } else {
      result[key] = value
    }
  }

  delete result.locales
  return result
}
