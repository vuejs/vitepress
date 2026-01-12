<script lang="ts" setup>
import '@docsearch/css'
import '@docsearch/css/dist/sidepanel.css'
import { onKeyStroke } from '@vueuse/core'
import type { DefaultTheme } from 'vitepress/theme'
import { computed, defineAsyncComponent, onMounted, onUnmounted, ref } from 'vue'
import { useData } from '../composables/data'
import { hasKeywordSearch, resolveDocSearchMode } from '../support/docsearch'
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

const resolvedAlgoliaMode = computed(() => resolveDocSearchMode(algoliaOptions.value))
const showKeywordSearchButton = computed(
  () =>
    resolvedAlgoliaMode.value !== 'sidePanel' &&
    hasKeywordSearch(algoliaOptions.value)
)

const askAiSidePanelConfig = computed(() => {
  const askAi = algoliaOptions.value.askAi
  if (!askAi || typeof askAi === 'string') return null
  if (!askAi.sidePanel) return null
  return askAi.sidePanel === true ? ({} as NonNullable<typeof askAi.sidePanel>) : askAi.sidePanel
})

const askAiShortcutEnabled = computed(() => {
  const cfg: any = askAiSidePanelConfig.value
  return cfg?.keyboardShortcuts?.['Ctrl/Cmd+I'] !== false
})

let isProgrammaticOpen = false

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
    if (isProgrammaticOpen) return

    const key = event.key?.toLowerCase()

    if (
      showKeywordSearchButton.value &&
      ((key === 'k' && (event.metaKey || event.ctrlKey)) ||
        (!isEditingContent(event) && event.key === '/'))
    ) {
      event.preventDefault()
      remove()
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
      remove()
      loadAndOpen('askAi')
    }
  }

  const remove = () => {
    window.removeEventListener('keydown', handleSearchHotKey)
  }

  window.addEventListener('keydown', handleSearchHotKey)

  onUnmounted(remove)
})

type OpenTarget = 'search' | 'askAi'

function programmaticOpen(target: OpenTarget) {
  isProgrammaticOpen = true
  open(target)
  queueMicrotask(() => {
    isProgrammaticOpen = false
  })
}

function loadAndOpen(target: OpenTarget) {
  if (!loaded.value) {
    loaded.value = true
    setTimeout(() => pollOpen(target, 0), 16)
    return
  }
  programmaticOpen(target)
}

function open(target: OpenTarget) {
  const e = new Event('keydown') as any

  e.key = target === 'search' ? 'k' : 'i'
  e.metaKey = true
  e.ctrlKey = true

  window.dispatchEvent(e)
}

function pollOpen(target: OpenTarget, tries: number) {
  // For askAi, first wait until sidepanel-js has rendered its button
  if (target === 'askAi') {
    const sidepanelReady = document.querySelector(
      '#docsearch-sidepanel .DocSearchSidepanel-Button, #docsearch-sidepanel [class*="Sidepanel"]'
    )
    if (!sidepanelReady) {
      if (tries < 120) {
        setTimeout(() => pollOpen(target, tries + 1), 16)
      }
      return
    }
  }

  programmaticOpen(target)

  setTimeout(() => {
    const opened =
      target === 'search'
        ? Boolean(document.querySelector('.DocSearch-Modal'))
        : Boolean(document.querySelector('[class*="Sidepanel"][class*="open"], [class*="Sidepanel"][class*="visible"]'))

    if (opened) return
    if (tries >= 120) return
    pollOpen(target, tries + 1)
  }, 16)
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
      <VPLocalSearchBox
        v-if="showSearch"
        @close="showSearch = false"
      />

      <div id="local-search">
        <VPNavBarSearchButton @click="showSearch = true" />
      </div>
    </template>

    <template v-else-if="provider === 'algolia'">
      <VPAlgoliaSearchBox
        v-if="loaded"
        :algolia="theme.search?.options ?? theme.algolia"
        @vue:beforeMount="actuallyLoaded = true"
      />

      <div v-if="!actuallyLoaded" id="docsearch">
        <VPNavBarSearchButton
          v-if="showKeywordSearchButton"
          @click="loadAndOpen('search')"
        />
      </div>

      <!-- Ask AI button (always visible when configured) -->
      <VPNavBarAskAiButton
        v-if="askAiSidePanelConfig"
        @click="loadAndOpen('askAi')"
      />

      <!-- Sidepanel-js renders the panel into this container -->
      <div id="docsearch-sidepanel" />
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
