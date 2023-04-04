<script lang="ts" setup>
import '@docsearch/css'
import { onKeyStroke } from '@vueuse/core'
import {
  computed,
  defineAsyncComponent,
  onMounted,
  onUnmounted,
  ref
} from 'vue'
import { useData } from '../composables/data'
import VPNavBarSearchButton from './VPNavBarSearchButton.vue'

const VPAlgoliaSearchBox = __ALGOLIA__
  ? defineAsyncComponent(() => import('./VPAlgoliaSearchBox.vue'))
  : () => null

const VPOfflineSearchBox = __ALGOLIA__
  ? () => null
  : defineAsyncComponent(() => import('./VPOfflineSearchBox.vue'))

const { theme, localeIndex } = useData()

// to avoid loading the docsearch js upfront (which is more than 1/3 of the
// payload), we delay initializing it until the user has actually clicked or
// hit the hotkey to invoke it.
const loaded = ref(false)

const buttonText = computed(() => {
  if (theme.value.algolia) {
    return theme.value.algolia.locales?.[localeIndex.value]?.translations?.button
      ?.buttonText ||
      theme.value.algolia.translations?.button?.buttonText ||
      'Search'
  } else if (typeof theme.value.offlineSearch === 'object') {
    return theme.value.offlineSearch.locales?.[localeIndex.value]?.translations?.button?.buttonText ||
      theme.value.offlineSearch.translations?.button?.buttonText ||
      'Search'
  }
  return 'Search'
})

const preconnect = () => {
  const id = 'VPAlgoliaPreconnect'

  const rIC = window.requestIdleCallback || setTimeout
  rIC(() => {
    const preconnect = document.createElement('link')
    preconnect.id = id
    preconnect.rel = 'preconnect'
    preconnect.href = `https://${theme.value.algolia!.appId}-dsn.algolia.net`
    preconnect.crossOrigin = ''
    document.head.appendChild(preconnect)
  })
}

onMounted(() => {
  if (!theme.value.algolia) {
    return
  }

  preconnect()

  const handleSearchHotKey = (e: KeyboardEvent) => {
    if (e.key === 'k' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
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

function load() {
  if (!loaded.value) {
    loaded.value = true
    setTimeout(poll, 16)
  }
}

function poll() {
  // programmatically open the search box after initialize
  const e = new Event('keydown') as any

  e.key = 'k'
  e.metaKey = true

  window.dispatchEvent(e)

  setTimeout(() => {
    if (!document.querySelector('.DocSearch-Modal')) {
      poll()
    }
  }, 16)
}

// Offline search

const showSearch = ref(false)

if (!__ALGOLIA__ && theme.value.offlineSearch) {
  onKeyStroke('k', event => {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault()
      showSearch.value = true
    }
  })
}
</script>

<template>
  <div class="VPNavBarSearch">
    <template v-if="theme.algolia">
      <VPAlgoliaSearchBox v-if="loaded" :algolia="theme.algolia" />

      <div v-else id="docsearch">
        <VPNavBarSearchButton :placeholder="buttonText" @click="load" />
      </div>
    </template>
    
    <template v-else-if="theme.offlineSearch">
      <VPOfflineSearchBox v-if="showSearch" :placeholder="buttonText" @close="showSearch = false" />

      <div id="offline-search">
        <VPNavBarSearchButton :placeholder="buttonText" @click="showSearch = true" />
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

.dark .DocSearch-Footer {
  border-top: 1px solid var(--vp-c-divider);
}

.DocSearch-Form {
  border: 1px solid var(--vp-c-brand);
  background-color: var(--vp-c-white);
}

.dark .DocSearch-Form {
  background-color: var(--vp-c-bg-soft-mute);
}

.DocSearch-Screen-Icon > svg {
  margin: auto;
}
</style>
