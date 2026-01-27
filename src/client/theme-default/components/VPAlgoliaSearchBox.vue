<script setup lang="ts">
import type { DocSearchInstance, DocSearchProps } from '@docsearch/js'
import type { SidepanelInstance, SidepanelProps } from '@docsearch/sidepanel-js'
import { useRouter } from 'vitepress'
import type { DefaultTheme } from 'vitepress/theme'
import { nextTick, onMounted, onUnmounted, watch } from 'vue'
import { useData } from '../composables/data'
import {
  buildAskAiConfig,
  mergeLangFacetFilters,
  resolveMode,
  validateCredentials
} from '../support/docsearch'
import type { DocSearchAskAi } from '../../../../types/docsearch'

const props = defineProps<{
  algolia: DefaultTheme.AlgoliaSearchOptions
  openRequest?: { target: 'search' | 'askAi' | 'toggleAskAi'; nonce: number } | null
}>()

const router = useRouter()
const { site, localeIndex, lang } = useData()

let cleanup: (() => void) | undefined
let docsearchInstance: DocSearchInstance | undefined
let sidepanelInstance: SidepanelInstance | undefined
let openOnReady: 'search' | 'askAi' | null = null
let initializeCount = 0
let docsearchLoader: Promise<typeof import('@docsearch/js')> | undefined
let sidepanelLoader: Promise<typeof import('@docsearch/sidepanel-js')> | undefined

onMounted(update)
watch(localeIndex, update)
onUnmounted(() => {
  cleanup?.()
})

watch(
  () => props.openRequest?.nonce,
  () => {
    const req = props.openRequest
    if (!req) return
    if (req.target === 'search') {
      if (docsearchInstance?.isReady) {
        docsearchInstance.open()
      } else {
        openOnReady = 'search'
      }
    } else if (req.target === 'toggleAskAi') {
      if (sidepanelInstance?.isOpen) {
        sidepanelInstance.close()
      } else {
        sidepanelInstance?.open()
      }
    } else {
      // askAi - open sidepanel or fallback to docsearch modal
      if (sidepanelInstance?.isReady) {
        sidepanelInstance.open()
      } else if (sidepanelInstance) {
        openOnReady = 'askAi'
      } else if (docsearchInstance?.isReady) {
        docsearchInstance.openAskAi()
      } else {
        openOnReady = 'askAi'
      }
    }
  },
  { immediate: true }
)

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

  const effectiveCredentials = validateCredentials({
    appId: options.appId || (askAi && typeof askAi === 'object' ? askAi.appId : undefined),
    apiKey: options.apiKey || (askAi && typeof askAi === 'object' ? askAi.apiKey : undefined),
    indexName: options.indexName || (askAi && typeof askAi === 'object' ? askAi.indexName : undefined)
  })

  if (!effectiveCredentials.valid) {
    console.warn(
      '[vitepress] Algolia search cannot be initialized: missing appId/apiKey/indexName.'
    )
    return
  }

  await initialize({
    ...options,
    appId: effectiveCredentials.appId,
    apiKey: effectiveCredentials.apiKey,
    indexName: effectiveCredentials.indexName,
    searchParameters: {
      ...options.searchParameters,
      facetFilters
    },
    askAi: askAi as DocSearchAskAi
  })
}

async function initialize(userOptions: DefaultTheme.AlgoliaSearchOptions) {
  const currentInitialize = ++initializeCount

  // Always tear down previous instances first (e.g. on locale changes)
  cleanup?.()

  const { useSidePanel, mode } = resolveMode(userOptions)
  const askAi = userOptions.askAi
  const sidePanelConfig = askAi && typeof askAi === 'object' ? askAi.sidePanel : undefined

  const { default: docsearch } = await loadDocsearch()
  if (currentInitialize !== initializeCount) return

  if (useSidePanel && askAi && typeof askAi === 'object' && sidePanelConfig) {
    const { keyboardShortcuts, ...restConfig } = sidePanelConfig !== true ? sidePanelConfig : {} as SidepanelProps
    const { default: sidepanel } = await loadSidepanel()
    if (currentInitialize !== initializeCount) return
    sidepanelInstance = sidepanel({
      ...restConfig,
      container: '#vp-docsearch-sidepanel',
      indexName: askAi.indexName ?? userOptions.indexName,
      appId: askAi.appId ?? userOptions.appId,
      apiKey: askAi.apiKey ?? userOptions.apiKey,
      assistantId: askAi.assistantId,
      onReady: () => {
        if (openOnReady === 'askAi') {
          openOnReady = null
          setTimeout(() => { sidepanelInstance?.open() }, 0)
        }
      },
    } as SidepanelProps)
  }

  const options = Object.assign({}, userOptions, {
    container: '#vp-docsearch',
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
    },

    // When sidepanel is enabled (and not in modal mode), intercept Ask AI events to open it instead (hybrid mode)
    ...(useSidePanel && sidepanelInstance && mode !== 'modal' && {
      interceptAskAiEvent: (initialMessage: { query: string; messageId?: string; suggestedQuestionId?: string }) => {
        docsearchInstance?.close()
        setTimeout(() => sidepanelInstance?.open(initialMessage), 0)
        return true
      }
    }),

    onReady: () => {
      if (openOnReady === 'search') {
        openOnReady = null
        setTimeout(() => docsearchInstance?.open(), 0)
      } else if (openOnReady === 'askAi' && !sidepanelInstance) {
        // No sidepanel configured, use docsearch modal for askAi
        openOnReady = null
        console.log('openAskAi', docsearchInstance)
        setTimeout(() => docsearchInstance?.openAskAi(), 0)
      }
    }
  })

  docsearchInstance = docsearch(options as DocSearchProps)

  cleanup = () => {
    docsearchInstance?.destroy()
    sidepanelInstance?.destroy()
    docsearchInstance = undefined
    sidepanelInstance = undefined
    openOnReady = null
  }
}

function loadDocsearch() {
  if (!docsearchLoader) {
    docsearchLoader = import('@docsearch/js')
  }
  return docsearchLoader
}

function loadSidepanel() {
  if (!sidepanelLoader) {
    sidepanelLoader = import('@docsearch/sidepanel-js')
  }
  return sidepanelLoader
}

function getRelativePath(url: string) {
  const { pathname, hash } = new URL(url, location.origin)
  return pathname.replace(/\.html$/, site.value.cleanUrls ? '' : '.html') + hash
}
</script>

<template>
  <div id="vp-docsearch" />
  <div id="vp-docsearch-sidepanel" />
</template>

<style scoped>
#vp-docsearch,
#vp-docsearch-sidepanel {
  display: none;
}
</style>
