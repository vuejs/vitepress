export interface DocSearchProps {
  appId: string
  apiKey: string
  indexName: string
  placeholder?: string
  searchParameters?: SearchOptions
  disableUserPersonalization?: boolean
  initialQuery?: string
  insights?: boolean
  translations?: DocSearchTranslations
  askAi?: DocSearchAskAi | string
}

export interface SearchOptions {
  query?: string
  similarQuery?: string
  facetFilters?: string | string[]
  optionalFilters?: string | string[]
  numericFilters?: string | string[]
  tagFilters?: string | string[]
  sumOrFiltersScores?: boolean
  filters?: string
  page?: number
  hitsPerPage?: number
  offset?: number
  length?: number
  attributesToHighlight?: string[]
  attributesToSnippet?: string[]
  attributesToRetrieve?: string[]
  highlightPreTag?: string
  highlightPostTag?: string
  snippetEllipsisText?: string
  restrictHighlightAndSnippetArrays?: boolean
  facets?: string[]
  maxValuesPerFacet?: number
  facetingAfterDistinct?: boolean
  minWordSizefor1Typo?: number
  minWordSizefor2Typos?: number
  allowTyposOnNumericTokens?: boolean
  disableTypoToleranceOnAttributes?: string[]
  queryType?: 'prefixLast' | 'prefixAll' | 'prefixNone'
  removeWordsIfNoResults?: 'none' | 'lastWords' | 'firstWords' | 'allOptional'
  advancedSyntax?: boolean
  advancedSyntaxFeatures?: ('exactPhrase' | 'excludeWords')[]
  optionalWords?: string | string[]
  disableExactOnAttributes?: string[]
  exactOnSingleWordQuery?: 'attribute' | 'none' | 'word'
  alternativesAsExact?: (
    | 'ignorePlurals'
    | 'singleWordSynonym'
    | 'multiWordsSynonym'
  )[]
  enableRules?: boolean
  ruleContexts?: string[]
  distinct?: boolean | number
  analytics?: boolean
  analyticsTags?: string[]
  synonyms?: boolean
  replaceSynonymsInHighlight?: boolean
  minProximity?: number
  responseFields?: string[]
  maxFacetHits?: number
  percentileComputation?: boolean
  clickAnalytics?: boolean
  personalizationImpact?: number
  enablePersonalization?: boolean
  restrictSearchableAttributes?: string[]
  sortFacetValuesBy?: 'count' | 'alpha'
  typoTolerance?: boolean | 'min' | 'strict'
  aroundLatLng?: string
  aroundLatLngViaIP?: boolean
  aroundRadius?: number | 'all'
  aroundPrecision?: number | { from: number; value: number }[]
  minimumAroundRadius?: number
  insideBoundingBox?: number[][]
  insidePolygon?: number[][]
  ignorePlurals?: boolean | string[]
  removeStopWords?: boolean | string[]
  naturalLanguages?: string[]
  getRankingInfo?: boolean
  userToken?: string
  enableABTest?: boolean
  decompoundQuery?: boolean
  relevancyStrictness?: number
}

export interface DocSearchTranslations {
  button?: ButtonTranslations
  modal?: ModalTranslations
}

export interface ButtonTranslations {
  buttonText?: string
  buttonAriaLabel?: string
}

export interface ModalTranslations extends ScreenStateTranslations {
  searchBox?: SearchBoxTranslations
  footer?: FooterTranslations
}

export interface ScreenStateTranslations {
  errorScreen?: ErrorScreenTranslations
  startScreen?: StartScreenTranslations
  resultsScreen?: ResultsScreenTranslations
  noResultsScreen?: NoResultsScreenTranslations
  askAiScreen?: AskAiScreenTranslations
}

export interface SearchBoxTranslations {
  clearButtonTitle?: string
  clearButtonAriaLabel?: string
  closeButtonText?: string
  closeButtonAriaLabel?: string
  placeholderText?: string
  placeholderTextAskAi?: string
  searchInputLabel?: string
  placeholderTextAskAiStreaming?: string
  backToKeywordSearchButtonText?: string
  backToKeywordSearchButtonAriaLabel?: string
}

export interface FooterTranslations {
  selectText?: string
  submitQuestionText?: string
  selectKeyAriaLabel?: string
  navigateText?: string
  navigateUpKeyAriaLabel?: string
  backToSearchText?: string
  navigateDownKeyAriaLabel?: string
  closeText?: string
  closeKeyAriaLabel?: string
  poweredByText?: string
}

export interface ErrorScreenTranslations {
  titleText?: string
  helpText?: string
}

export interface StartScreenTranslations {
  recentSearchesTitle?: string
  noRecentSearchesText?: string
  saveRecentSearchButtonTitle?: string
  removeRecentSearchButtonTitle?: string
  favoriteSearchesTitle?: string
  removeFavoriteSearchButtonTitle?: string
  recentConversationsTitle?: string
  removeRecentConversationButtonTitle?: string
}

export interface ResultsScreenTranslations {
  askAiPlaceholder?: string
}

export interface NoResultsScreenTranslations {
  noResultsText?: string
  suggestedQueryText?: string
  reportMissingResultsText?: string
  reportMissingResultsLinkText?: string
}

export interface AskAiScreenTranslations {
  disclaimerText?: string
  relatedSourcesText?: string
  thinkingText?: string
  copyButtonText?: string
  copyButtonCopiedText?: string
  copyButtonTitle?: string
  likeButtonTitle?: string
  dislikeButtonTitle?: string
  thanksForFeedbackText?: string
  preToolCallText?: string
  duringToolCallText?: string
  afterToolCallText?: string
  aggregatedToolCallText?: string
}

export interface DocSearchAskAi {
  /**
   * The index name to use for the ask AI feature. Your assistant will search this index for relevant documents.
   * If not provided, the index name will be used.
   */
  indexName?: string
  /**
   * The API key to use for the ask AI feature. Your assistant will use this API key to search the index.
   * If not provided, the API key will be used.
   */
  apiKey?: string
  /**
   * The app ID to use for the ask AI feature. Your assistant will use this app ID to search the index.
   * If not provided, the app ID will be used.
   */
  appId?: string
  /**
   * The assistant ID to use for the ask AI feature.
   */
  assistantId: string | null
  /**
   * The search parameters to use for the ask AI feature.
   */
  searchParameters?: {
    facetFilters?: SearchOptions['facetFilters']
  }
}
