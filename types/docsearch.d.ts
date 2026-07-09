import { type DocSearchProps as DocSearchPropsJS } from '@docsearch/js'
import { type SidepanelProps as SidepanelPropsBase } from '@docsearch/sidepanel-js'

export type DocSearchProps = Partial<
  Pick<
    DocSearchPropsJS,
    | 'appId'
    | 'apiKey'
    | 'placeholder'
    | 'maxResultsPerGroup'
    | 'disableUserPersonalization'
    | 'initialQuery'
    | 'translations'
    | 'recentSearchesLimit'
    | 'recentSearchesWithFavoritesLimit'
  >
> & {
  /**
   * Name of the algolia index to query.
   */
  indexName?: string
  /**
   * Additional algolia search parameters to merge into each query.
   */
  searchParameters?: DocSearchPropsJS['searchParameters']
  /**
   * Insights client integration options to send analytics events.
   */
  insights?: boolean
  /**
   * Configuration or assistant id to enable ask ai mode. Pass a string assistant id or a full config object.
   */
  askAi?: DocSearchAskAi | string
  /**
   * Ask AI side panel integration mode.
   *
   * - 'auto': infer hybrid vs sidePanel-only from provided config
   * - 'sidePanel': force sidePanel-only even if keyword search is configured
   * - 'hybrid': force hybrid (error if keyword search is not configured)
   * - 'modal': force modal even if sidePanel is configured (ask ai in modal stays in modal)
   *
   * @default 'auto'
   */
  mode?: 'auto' | 'sidePanel' | 'hybrid' | 'modal'
}

export type DocSearchAskAi = Partial<
  Exclude<DocSearchPropsJS['askAi'], string | undefined>
> & {
  /**
   * Ask AI side panel configuration.
   */
  sidePanel?: boolean | SidepanelProps
}

export type SidepanelProps = Partial<
  Pick<SidepanelPropsBase, 'button' | 'keyboardShortcuts'>
> & {
  /**
   * Props specific to the Sidepanel panel.
   */
  panel?: Omit<NonNullable<SidepanelPropsBase['panel']>, 'portalContainer'>
}
