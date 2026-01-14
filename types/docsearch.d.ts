import { type DocSearchProps as DocSearchPropsJS } from '@docsearch/js'
import { type SidepanelProps as SidepanelPropsBase } from '@docsearch/sidepanel-js'

/**
 * Sidepanel translation configuration (for locale configs).
 */
export type SidepanelTranslations = NonNullable<
  NonNullable<SidepanelPropsBase['button']>['translations']
> & {
  panel?: NonNullable<NonNullable<SidepanelPropsBase['panel']>['translations']>
}

/**
 * Partial sidepanel props for locale configs where auth fields are inherited from the main config.
 */
export type SidepanelProps = Partial<Omit<SidepanelPropsBase, 'container'>>

export interface DocSearchProps {
  /**
   * Keyword search (optional when using Ask AI side panel only).
   */
  appId?: string
  apiKey?: string
  indexName?: string
  placeholder?: string
  searchParameters?: DocSearchPropsJS['searchParameters']
  disableUserPersonalization?: boolean
  initialQuery?: string
  insights?: boolean
  translations?: DocSearchPropsJS['translations']
  askAi?: DocSearchAskAi | string
  /**
   * Ask AI side panel integration mode.
   *
   * @default 'auto'
   * - 'auto': infer hybrid vs sidePanel-only from provided config
   * - 'sidePanel': force sidePanel-only even if keyword search is configured
   * - 'hybrid': force hybrid (error if keyword search is not configured)
   * - 'modal': force modal even if sidePanel is configured (ask ai in modal stays in modal)
   */
  mode?: 'auto' | 'sidePanel' | 'hybrid' | 'modal'
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
   * Optional in locale configs where it's inherited from the main config.
   */
  assistantId?: string | null
  /**
   * The search parameters to use for the ask AI feature.
   */
  searchParameters?: Pick<
    DocSearchPropsJS['searchParameters'],
    | 'facetFilters'
    | 'filters'
    | 'attributesToRetrieve'
    | 'restrictSearchableAttributes'
    | 'distinct'
  >
  /**
   * Enables/disables showing suggested questions on Ask AI's new conversation screen.
   */
  suggestedQuestions?: boolean
  /**
   * Ask AI side panel configuration.
   */
  sidePanel?: boolean | SidepanelProps
}
