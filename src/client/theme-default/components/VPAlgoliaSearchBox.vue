<script setup lang="ts">
import docsearch from '@docsearch/js'
import sidepanel from '@docsearch/sidepanel-js'
import { useRouter } from 'vitepress'
import type { DefaultTheme } from 'vitepress/theme'
import { nextTick, onMounted, onUnmounted, watch } from 'vue'
import { useData } from '../composables/data'
import {
  buildAskAiConfig,
  hasKeywordSearch,
  mergeLangFacetFilters,
  resolveDocSearchMode,
  validateCredentials
} from '../support/docsearch'

const props = defineProps<{
  algolia: DefaultTheme.AlgoliaSearchOptions
}>()

const router = useRouter()
const { site, localeIndex, lang } = useData()

let cleanup: (() => void) | undefined

onMounted(update)
watch(localeIndex, update)
onUnmounted(() => {
  cleanup?.()
})

async function update() {
  await nextTick()
  const options = {
    ...props.algolia,
    ...props.algolia.locales?.[localeIndex.value]
  }
  const facetFilters = mergeLangFacetFilters(
    options.searchParameters?.facetFilters,
    lang.value
  ) as string | string[]

  const askAi = options.askAi
    ? buildAskAiConfig(options.askAi, options, lang.value)
    : undefined

  const resolvedMode = resolveDocSearchMode({
    mode: options.mode,
    appId: options.appId,
    apiKey: options.apiKey,
    indexName: options.indexName,
    askAi: askAi as any
  })

  const keywordConfigured = hasKeywordSearch(options)

  // For sidePanel mode, credentials can come from askAi config
  const effectiveCredentials = validateCredentials({
    appId: options.appId || (askAi && typeof askAi === 'object' ? askAi.appId : undefined),
    apiKey: options.apiKey || (askAi && typeof askAi === 'object' ? askAi.apiKey : undefined),
    indexName: options.indexName || (askAi && typeof askAi === 'object' ? askAi.indexName : undefined)
  })

  if (resolvedMode === 'hybrid' && !keywordConfigured) {
    console.warn(
      '[vitepress] Algolia search mode is set to "hybrid" but keyword search is not configured (missing appId/apiKey/indexName).'
    )
    return
  }

  if (!effectiveCredentials.valid) {
    console.warn(
      '[vitepress] Algolia search cannot be initialized: missing appId/apiKey/indexName.'
    )
    return
  }

  // Clean up any previous initialization (locale switch etc)
  cleanup?.()
  cleanup = undefined

  initialize({
    ...options,
    appId: effectiveCredentials.appId,
    apiKey: effectiveCredentials.apiKey,
    indexName: effectiveCredentials.indexName,
    searchParameters: {
      ...options.searchParameters,
      facetFilters
    },
    askAi: askAi as any
  })
}

function initialize(userOptions: DefaultTheme.AlgoliaSearchOptions) {
  // Ensure containers exist and start clean
  const searchContainer = document.querySelector('#docsearch')
  const sidePanelContainer = document.querySelector('#docsearch-sidepanel')
  if (searchContainer) (searchContainer as HTMLElement).innerHTML = ''
  if (sidePanelContainer) (sidePanelContainer as HTMLElement).innerHTML = ''

  const options = Object.assign({}, userOptions, {
    container: '#docsearch',

    navigator: {
      navigate(item: { itemUrl: string }) {
        router.go(item.itemUrl)
      }
    },

    transformItems(items: { url: string }[]) {
      return items.map((item) => {
        return Object.assign({}, item, {
          url: getRelativePath(item.url)
        })
      })
    }
  })

  docsearch(options as any)

  // Side panel init (mirrors the demo-js example)
  // @see https://docsearch.algolia.com/docs/sidepanel/api-reference
  const askAi = userOptions.askAi
  const sidePanelConfig =
    askAi && typeof askAi === 'object' ? askAi.sidePanel : undefined

  if (askAi && typeof askAi === 'object' && sidePanelConfig) {
    const { keyboardShortcuts, ...restConfig } = sidePanelConfig !== true ? sidePanelConfig : {}
    sidepanel({
      container: '#docsearch-sidepanel',
      indexName: askAi.indexName ?? userOptions.indexName,
      appId: askAi.appId ?? userOptions.appId,
      apiKey: askAi.apiKey ?? userOptions.apiKey,
      assistantId: askAi.assistantId,
      ...restConfig
      // keyboardShortcuts removed - always use default Cmd+I / Ctrl+I
    } as any)
  }

  cleanup = () => {
    // best-effort cleanup: remove rendered markup
    if (searchContainer) (searchContainer as HTMLElement).innerHTML = ''
    if (sidePanelContainer) (sidePanelContainer as HTMLElement).innerHTML = ''
  }
}

function getRelativePath(url: string) {
  const { pathname, hash } = new URL(url, location.origin)
  return pathname.replace(/\.html$/, site.value.cleanUrls ? '' : '.html') + hash
}
</script>

<template>
  <div id="docsearch" />
</template>
