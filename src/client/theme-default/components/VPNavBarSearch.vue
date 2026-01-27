<script lang="ts" setup>
import '@docsearch/css'
import '@docsearch/css/dist/sidepanel.css'
import { onKeyStroke } from '@vueuse/core'
import type { DefaultTheme } from 'vitepress/theme'
import { computed, defineAsyncComponent, onMounted, onUnmounted, ref } from 'vue'
import { useData } from '../composables/data'
import { resolveMode } from '../support/docsearch'
import VPNavBarAskAiButton from './VPNavBarAskAiButton.vue'
import VPNavBarSearchButton from './VPNavBarSearchButton.vue'

const VPLocalSearchBox = __VP_LOCAL_SEARCH__
  ? defineAsyncComponent(() => import('./VPLocalSearchBox.vue'))
  : () => null

const VPAlgoliaSearchBox = __ALGOLIA__
  ? defineAsyncComponent(() => import('./VPAlgoliaSearchBox.vue'))
  : () => null

const { theme, localeIndex } = useData()

const algoliaOptions = computed(() => {
  const base =
    ((theme.value.search?.options as DefaultTheme.AlgoliaSearchOptions) ??
      theme.value.algolia) ||
    ({} as DefaultTheme.AlgoliaSearchOptions)
  return {
    ...base,
    ...base.locales?.[localeIndex.value]
  } as DefaultTheme.AlgoliaSearchOptions
})

const resolvedMode = computed(() => resolveMode(algoliaOptions.value))

const showKeywordSearchButton = computed(
  () => resolvedMode.value.showKeywordSearch
)

const askAiSidePanelConfig = computed(() => {
  if (!resolvedMode.value.useSidePanel) return null
  const askAi = algoliaOptions.value.askAi
  if (!askAi || typeof askAi === 'string') return null
  if (!askAi.sidePanel) return null
  return askAi.sidePanel === true ? ({} as NonNullable<typeof askAi.sidePanel>) : askAi.sidePanel
})

const askAiShortcutEnabled = computed(() => {
  const cfg: any = askAiSidePanelConfig.value
  return cfg?.keyboardShortcuts?.['Ctrl/Cmd+I'] !== false
})

type OpenTarget = 'search' | 'askAi' | 'toggleAskAi'
type OpenRequest = { target: OpenTarget; nonce: number }
const openRequest = ref<OpenRequest | null>(null)
let openNonce = 0

// to avoid loading the docsearch js upfront (which is more than 1/3 of the
// payload), we delay initializing it until the user has actually clicked or
// hit the hotkey to invoke it.
const loaded = ref(false)
const actuallyLoaded = ref(false)

const preconnect = () => {
  const id = 'VPAlgoliaPreconnect'

  if (document.getElementById(id)) return

  const appId =
    algoliaOptions.value.appId ||
    (typeof algoliaOptions.value.askAi === 'object'
      ? algoliaOptions.value.askAi?.appId
      : undefined)

  if (!appId) return

  const rIC = window.requestIdleCallback || setTimeout
  rIC(() => {
    const preconnect = document.createElement('link')
    preconnect.id = id
    preconnect.rel = 'preconnect'
    preconnect.href = `https://${appId}-dsn.algolia.net`
    preconnect.crossOrigin = ''
    document.head.appendChild(preconnect)
  })
}

onMounted(() => {
  if (!__ALGOLIA__) {
    return
  }

  preconnect()

  const handleSearchHotKey = (event: KeyboardEvent) => {
    const key = event.key?.toLowerCase()

    if (
      showKeywordSearchButton.value &&
      ((key === 'k' && (event.metaKey || event.ctrlKey)) ||
        (!isEditingContent(event) && event.key === '/'))
    ) {
      event.preventDefault()
      loadAndOpen('search')
      return
    }

    if (
      askAiSidePanelConfig.value &&
      askAiShortcutEnabled.value &&
      key === 'i' &&
      (event.metaKey || event.ctrlKey) &&
      !isEditingContent(event)
    ) {
      event.preventDefault()
      loadAndOpen('askAi')
    }
  }

  const remove = () => {
    window.removeEventListener('keydown', handleSearchHotKey)
  }

  window.addEventListener('keydown', handleSearchHotKey)

  onUnmounted(remove)
})

function loadAndOpen(target: OpenTarget) {
  if (!loaded.value) {
    loaded.value = true
  }

  // This will either be handled immediately if DocSearch is ready,
  // or queued by the AlgoliaSearchBox until its instances become ready.
  openRequest.value = { target, nonce: ++openNonce }
}

function isEditingContent(event: KeyboardEvent): boolean {
  const element = event.target as HTMLElement
  const tagName = element.tagName

  return (
    element.isContentEditable ||
    tagName === 'INPUT' ||
    tagName === 'SELECT' ||
    tagName === 'TEXTAREA'
  )
}

// Local search

const showSearch = ref(false)

if (__VP_LOCAL_SEARCH__) {
  onKeyStroke('k', (event) => {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault()
      showSearch.value = true
    }
  })

  onKeyStroke('/', (event) => {
    if (!isEditingContent(event)) {
      event.preventDefault()
      showSearch.value = true
    }
  })
}

const provider = __ALGOLIA__ ? 'algolia' : __VP_LOCAL_SEARCH__ ? 'local' : ''
</script>

<template>
  <div class="VPNavBarSearch">
    <template v-if="provider === 'local'">
      <VPLocalSearchBox v-if="showSearch" @close="showSearch = false" />

      <div id="local-search">
        <VPNavBarSearchButton @click="showSearch = true" />
      </div>
    </template>

    <template v-else-if="provider === 'algolia'">
      <VPNavBarSearchButton v-if="showKeywordSearchButton" @click="loadAndOpen('search')" />
      <VPNavBarAskAiButton v-if="askAiSidePanelConfig"
        @click="actuallyLoaded ? loadAndOpen('toggleAskAi') : loadAndOpen('askAi')" />
      <VPAlgoliaSearchBox v-if="loaded" :algolia="theme.search?.options ?? theme.algolia" :open-request="openRequest"
        @vue:beforeMount="actuallyLoaded = true" />
    </template>
  </div>
</template>

<style>
.VPNavBarSearch {
  display: flex;
  align-items: center;
  gap: 8px;
}

@media (min-width: 768px) {
  .VPNavBarSearch {
    flex-grow: 1;
    padding-left: 24px;
  }
}

@media (min-width: 960px) {
  .VPNavBarSearch {
    padding-left: 32px;
  }
}
</style>
