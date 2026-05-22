<script lang="ts" setup>
import { onKeyStroke } from '@vueuse/core'
import type { DefaultTheme } from 'vitepress/theme'
import { computed, defineAsyncComponent, onMounted, ref } from 'vue'
import { useData } from '../composables/data'
import { resolveMode, resolveOptionsForLanguage } from '../support/docsearch'
import { smartComputed } from '../support/reactivity'
import VPNavBarAskAiButton from './VPNavBarAskAiButton.vue'
import VPNavBarSearchButton from './VPNavBarSearchButton.vue'

const VPLocalSearchBox = __VP_LOCAL_SEARCH__
  ? defineAsyncComponent(() => import('./VPLocalSearchBox.vue'))
  : () => null

const VPAlgoliaSearchBox = __ALGOLIA__
  ? defineAsyncComponent(() => import('./VPAlgoliaSearchBox.vue'))
  : () => null

const { theme, localeIndex, lang } = useData()
const provider = __ALGOLIA__ ? 'algolia' : __VP_LOCAL_SEARCH__ ? 'local' : ''

// #region Algolia Search

const algoliaOptions = smartComputed<DefaultTheme.AlgoliaSearchOptions>(() => {
  return resolveOptionsForLanguage(
    theme.value.search?.options || {},
    localeIndex.value,
    lang.value
  )
})

const resolvedMode = computed(() => resolveMode(algoliaOptions.value))

const askAiSidePanelConfig = computed(() => {
  if (!resolvedMode.value.useSidePanel) return null
  const askAi = algoliaOptions.value.askAi
  if (!askAi || typeof askAi === 'string') return null
  if (!askAi.sidePanel) return null
  return askAi.sidePanel === true ? {} : askAi.sidePanel
})

const askAiShortcutEnabled = computed(() => {
  return askAiSidePanelConfig.value?.keyboardShortcuts?.['Ctrl/Cmd+I'] !== false
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

onMounted(() => {
  if (!__ALGOLIA__) return

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
})

if (__ALGOLIA__) {
  onKeyStroke('k', (event) => {
    if (
      resolvedMode.value.showKeywordSearch &&
      (event.ctrlKey || event.metaKey)
    ) {
      event.preventDefault()
      loadAndOpen('search')
    }
  })

  onKeyStroke('i', (event) => {
    if (
      askAiSidePanelConfig.value &&
      askAiShortcutEnabled.value &&
      (event.ctrlKey || event.metaKey)
    ) {
      event.preventDefault()
      loadAndOpen('askAi')
    }
  })

  onKeyStroke('/', (event) => {
    if (resolvedMode.value.showKeywordSearch && !isEditingContent(event)) {
      event.preventDefault()
      loadAndOpen('search')
    }
  })
}

function loadAndOpen(target: OpenTarget) {
  if (!loaded.value) {
    loaded.value = true
  }

  // This will either be handled immediately if DocSearch is ready,
  // or queued by the AlgoliaSearchBox until its instances become ready.
  openRequest.value = { target, nonce: ++openNonce }
}

// #endregion

// #region Local Search

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

// #endregion

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
</script>

<template>
  <div class="VPNavBarSearch">
    <template v-if="provider === 'algolia'">
      <VPNavBarSearchButton
        v-if="resolvedMode.showKeywordSearch"
        :text="algoliaOptions.translations?.button?.buttonText || 'Search'"
        :aria-label="algoliaOptions.translations?.button?.buttonAriaLabel || 'Search'"
        :aria-keyshortcuts="'/ control+k meta+k'"
        @click="loadAndOpen('search')"
      />
      <VPNavBarAskAiButton
        v-if="askAiSidePanelConfig"
        :aria-label="askAiSidePanelConfig.button?.translations?.buttonAriaLabel || 'Ask AI'"
        :aria-keyshortcuts="askAiShortcutEnabled ? 'control+i meta+i' : undefined"
        @click="actuallyLoaded ? loadAndOpen('toggleAskAi') : loadAndOpen('askAi')"
      />
      <VPAlgoliaSearchBox
        v-if="loaded"
        :algolia-options
        :open-request
        @vue:beforeMount="actuallyLoaded = true"
      />
    </template>
    <template v-else-if="provider === 'local'">
      <VPNavBarSearchButton
        :text="algoliaOptions.translations?.button?.buttonText || 'Search'"
        :aria-label="algoliaOptions.translations?.button?.buttonAriaLabel || 'Search'"
        :aria-keyshortcuts="'/ control+k meta+k'"
        @click="showSearch = true"
      />
      <VPLocalSearchBox
        v-if="showSearch"
        @close="showSearch = false"
      />
    </template>
  </div>
</template>

<style scoped>
.VPNavBarSearch {
  display: flex;
  align-items: center;
}

@media (min-width: 768px) {
  .VPNavBarSearch {
    gap: 8px;
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
