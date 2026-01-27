<script lang="ts" setup>
import '@docsearch/css'
import { onKeyStroke } from '@vueuse/core'
import type { DefaultTheme } from 'vitepress/theme'
import { defineAsyncComponent, onMounted, onUnmounted, ref, watch } from 'vue'
import { useData } from '../composables/data'
import VPNavBarSearchButton from './VPNavBarSearchButton.vue'

defineProps<{
  iconOnly?: boolean
}>()

const VPLocalSearchBox = __VP_LOCAL_SEARCH__
  ? defineAsyncComponent(() => import('./VPLocalSearchBox.vue'))
  : () => null

const VPAlgoliaSearchBox = __ALGOLIA__
  ? defineAsyncComponent(() => import('./VPAlgoliaSearchBox.vue'))
  : () => null

const { theme } = useData()

// to avoid loading the docsearch js upfront (which is more than 1/3 of the
// payload), we delay initializing it until the user has actually clicked or
// hit the hotkey to invoke it.
const loaded = ref(false)
const actuallyLoaded = ref(false)
const pendingSearch = ref(false)

const preconnect = () => {
  const id = 'VPAlgoliaPreconnect'

  const rIC = window.requestIdleCallback || setTimeout
  rIC(() => {
    const preconnect = document.createElement('link')
    preconnect.id = id
    preconnect.rel = 'preconnect'
    preconnect.href = `https://${
      ((theme.value.search?.options as DefaultTheme.AlgoliaSearchOptions) ??
        theme.value.algolia)!.appId
    }-dsn.algolia.net`
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
    if (
      (event.key?.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) ||
      (!isEditingContent(event) && event.key === '/')
    ) {
      event.preventDefault()
      load()
      remove()
    }
  }

  const remove = () => {
    window.removeEventListener('keydown', handleSearchHotKey)
  }

  window.addEventListener('keydown', handleSearchHotKey)

  onUnmounted(remove)
})

function triggerAlgoliaSearch() {
  const e = new KeyboardEvent('keydown', {
    key: 'k',
    metaKey: true,
  })
  window.dispatchEvent(e)
}

function load() {
  if (!loaded.value) {
    loaded.value = true
    setTimeout(poll, 16)
  }
}

function poll() {
  // programmatically open the search box after initialize
  triggerAlgoliaSearch()

  setTimeout(() => {
    if (!document.querySelector('.DocSearch-Modal')) {
      poll()
    }
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

watch(actuallyLoaded, (value) => {
  if (value && pendingSearch.value) {
    pendingSearch.value = false
    poll()
  }
})

function openSearch() {
  if (__VP_LOCAL_SEARCH__) {
    showSearch.value = true
  } else if (__ALGOLIA__) {
    if (actuallyLoaded.value) {
      triggerAlgoliaSearch()
    } else {
      pendingSearch.value = true
      loaded.value = true
    }
  }
}

defineExpose({ openSearch })
</script>

<template>
  <div class="VPNavBarSearch" :class="{ 'icon-only': iconOnly }">
    <template v-if="provider === 'local'">
      <VPLocalSearchBox
        v-if="showSearch"
        @close="showSearch = false"
      />

      <div v-if="!iconOnly" id="local-search">
        <VPNavBarSearchButton @click="showSearch = true" />
      </div>
    </template>

    <template v-else-if="provider === 'algolia'">
      <VPAlgoliaSearchBox
        v-if="loaded"
        :algolia="theme.search?.options ?? theme.algolia"
        @vue:beforeMount="actuallyLoaded = true"
      />

      <div v-if="!actuallyLoaded && !iconOnly" id="docsearch">
        <VPNavBarSearchButton @click="load" />
      </div>
    </template>
  </div>
</template>

<style>
.VPNavBarSearch {
  display: flex;
  align-items: center;
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

.VPNavBarSearch.icon-only {
  flex-grow: 0;
  padding-left: 0;
}

.VPNavBarSearch.icon-only #docsearch {
  display: none;
}
</style>
