import type { SidepanelProps } from '@docsearch/sidepanel-js'
import type { DefaultTheme } from 'vitepress/theme'
import type { DocSearchAskAi } from '../../../../types/docsearch'
import { isObject } from '../../shared'

export type FacetFilter = string | string[] | FacetFilter[]

export interface ValidatedCredentials {
  valid: boolean
  appId?: string
  apiKey?: string
  indexName?: string
}

export type DocSearchMode = 'auto' | 'sidePanel' | 'hybrid' | 'modal'

export interface ResolvedMode {
  mode: DocSearchMode
  showKeywordSearch: boolean
  useSidePanel: boolean
}

export type ResolvedSidePanelProps = SidepanelProps & {
  agentStudio?: boolean
  searchParameters?: DocSearchAskAi['searchParameters']
  suggestedQuestions?: boolean
  useStagingEnv?: boolean
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
    'appId' | 'apiKey' | 'indexName' | 'askAi' | 'mode'
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
          '[vitepress] mode: "hybrid" requires keyword search credentials (appId, apiKey, indexName).'
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
): DocSearchAskAi {
  const isAskAiString = typeof askAiProp === 'string'

  const askAiSearchParameters =
    !isAskAiString && askAiProp.searchParameters
      ? { ...askAiProp.searchParameters }
      : undefined
  const isAgentStudio = !isAskAiString && askAiProp.agentStudio === true

  const askAiFacetFiltersSource =
    askAiSearchParameters?.facetFilters ??
    options.searchParameters?.facetFilters
  const askAiFacetFilters = mergeLangFacetFilters(
    askAiFacetFiltersSource as FacetFilter | FacetFilter[] | undefined,
    lang
  )

  const mergedAskAiSearchParameters = isAgentStudio
    ? askAiSearchParameters
    : {
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
  if (
    mergedAskAiSearchParameters &&
    Object.values(mergedAskAiSearchParameters).some((v) => v != null)
  ) {
    result.searchParameters = mergedAskAiSearchParameters
  }

  return result
}

/**
 * Builds the DocSearch side panel config from the resolved Ask AI options.
 */
export function buildSidePanelProps(
  askAi: DocSearchAskAi,
  options: DefaultTheme.AlgoliaSearchOptions
): ResolvedSidePanelProps {
  const sidePanelOptions =
    askAi.sidePanel && askAi.sidePanel !== true ? askAi.sidePanel : {}

  const result: ResolvedSidePanelProps = {
    ...sidePanelOptions,
    container: '#vp-docsearch-sidepanel',
    indexName: (askAi.indexName ?? options.indexName)!,
    appId: (askAi.appId ?? options.appId)!,
    apiKey: (askAi.apiKey ?? options.apiKey)!,
    assistantId: askAi.assistantId!
  }

  if (askAi.agentStudio !== undefined) {
    result.agentStudio = askAi.agentStudio
  }

  if (askAi.searchParameters !== undefined) {
    result.searchParameters = askAi.searchParameters
  }

  if (askAi.suggestedQuestions !== undefined) {
    result.suggestedQuestions = askAi.suggestedQuestions
  }

  if (askAi.useStagingEnv !== undefined) {
    result.useStagingEnv = askAi.useStagingEnv
  }

  return result
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

  const facetFilters = mergeLangFacetFilters(
    options.searchParameters?.facetFilters,
    lang
  )
  const askAi = options.askAi
    ? buildAskAiConfig(options.askAi, options, lang)
    : undefined

  return {
    ...options,
    searchParameters: { ...options.searchParameters, facetFilters },
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
