<script lang="ts" setup>
import { computed, markRaw, nextTick, onMounted, ref, shallowRef, watch } from 'vue'
import { useRouter } from 'vitepress'
import { onKeyStroke, useSessionStorage } from '@vueuse/core'
import MiniSearch from 'minisearch'
import offlineSearchIndex from '@offlineSearchIndex'
import { useData } from '../composables/data'
import { createTranslate } from '../support/translation'
import type { ModalTranslations } from '../../../../types/offline-search'

defineProps<{
  placeholder: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

/* Search */

const searchIndexData = shallowRef(offlineSearchIndex)

// hmr
if (import.meta.hot) {
  import.meta.hot.accept('/@offlineSearchIndex', (m) => {
    if (m) {
      searchIndexData.value = m.default
    }
  })
}

const searchIndex = computed(() => markRaw(MiniSearch.loadJSON(searchIndexData.value, {
  fields: ['title', 'titles', 'text'],
  storeFields: ['title', 'titles'],
  searchOptions: {
    fuzzy: 0.2,
    prefix: true,
    boost: { title: 4, text: 2, titles: 1 },
  },
})))

const filterText = useSessionStorage('vitepress:offline-search-filter', '')

const results = computed(() => searchIndex.value.search(filterText.value))

/* Search input focus */

const searchInput = ref<HTMLInputElement>()

function focusSearchInput () {
  searchInput.value?.focus()
  searchInput.value?.select()
}

onMounted(() => {
  focusSearchInput()
})

/* Search keyboard selection */

const selectedIndex = ref(0)
const disableMouseOver = ref(false)

watch(results, () => {
  selectedIndex.value = 0
})

function scrollToSelectedResult () {
  nextTick(() => {
    const selectedEl = document.querySelector('.result.selected')
    if (selectedEl) {
      selectedEl.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  })
}

onKeyStroke('ArrowUp', (event) => {
  event.preventDefault()
  selectedIndex.value--
  if (selectedIndex.value < 0) {
    selectedIndex.value = results.value.length - 1
  }
  disableMouseOver.value = true
  scrollToSelectedResult()
})

onKeyStroke('ArrowDown', (event) => {
  event.preventDefault()
  selectedIndex.value++
  if (selectedIndex.value >= results.value.length) {
    selectedIndex.value = 0
  }
  disableMouseOver.value = true
  scrollToSelectedResult()
})

const router = useRouter()

onKeyStroke('Enter', () => {
  const selectedPackage = results.value[selectedIndex.value]
  if (selectedPackage) {
    router.go(selectedPackage.id)
    emit('close')
  }
})

onKeyStroke('Escape', () => {
  emit('close')
})

// Translations

const { theme } = useData()

const defaultTranslations: ModalTranslations = {
  noResultsText: 'No results for',
  footer: {
    selectText: 'to select',
    selectKeyAriaLabel: 'enter',
    navigateText: 'to navigate',
    navigateUpKeyAriaLabel: 'up arrow',
    navigateDownKeyAriaLabel: 'down arrow',
  }
}

const $t = createTranslate(theme.value.offlineSearch, defaultTranslations)
</script>

<template>
  <Teleport to="body">
    <div class="VPOfflineSearchBox" aria-modal="true">
      <div class="backdrop" @click="$emit('close')" />

      <div class="shell">
        <div class="search-bar" @click="focusSearchInput()">
          <svg width="16" height="16" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21l-4.35-4.35"/></g></svg>
          <input
            ref="searchInput"
            v-model="filterText"
            :placeholder="placeholder"
            class="search-input"
          >
        </div>

        <div
          class="results"
          @mousemove="disableMouseOver = false"
        >
          <a
            v-for="(p, index) in results"
            :key="p.id"
            :href="p.id"
            class="result"
            :class="{
              selected: selectedIndex === index,
            }"
            @mouseenter="!disableMouseOver && (selectedIndex = index)"
            @click="$emit('close')"
          >
            <div>
              <div class="titles">
                <span class="title-icon">#</span>
                <span
                  v-for="(t, index) in p.titles"
                  :key="index"
                  class="title"
                >
                  <span class="text" v-html="t" />
                  <svg width="16" height="16" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m9 18l6-6l-6-6"/></svg>
                </span>
                <span class="title main">
                  <span class="text" v-html="p.title" />
                </span>
              </div>
            </div>
          </a>

          <div v-if="filterText && !results.length" class="no-results">
            {{ $t('noResultsText') }} "<strong>{{ filterText }}</strong>"
          </div>
        </div>

        <div class="search-keyboard-shortcuts">
          <span>
            <kbd :aria-title="$t('footer.navigateUpKeyAriaLabel')"><svg width="14" height="14" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19V5m-7 7l7-7l7 7"/></svg></kbd> <kbd :aria-title="$t('footer.navigateDownKeyAriaLabel')"><svg width="14" height="14" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v14m7-7l-7 7l-7-7"/></svg></kbd>
            {{ $t('footer.navigateText') }}
          </span>
          <span>
            <kbd :aria-title="$t('footer.selectKeyAriaLabel')"><svg width="14" height="14" viewBox="0 0 24 24"><g fill="none" stroke="currentcolor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="m9 10l-5 5l5 5"/><path d="M20 4v7a4 4 0 0 1-4 4H4"/></g></svg></kbd>
            {{ $t('footer.selectText') }}
          </span>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped lang="postcss">
.VPOfflineSearchBox {
  position: fixed;
  z-index: 100;
  inset: 0;
  display: flex;
}

.backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
}

.shell {
  position: relative;
  padding: 12px;
  margin: 64px auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: var(--vp-c-bg);
  width: min(100vw - 60px, 768px);
  height: min-content;
  max-height: min(100vh - 128px, 500px);
  border-radius: 6px;
}

.search-bar {
  border: 1px solid rgba(128, 128, 128, 0.2);
  border-radius: 4px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  cursor: text;
}

.search-bar:focus-within {
  border-color: var(--vp-c-brand);
}

.search-input {
  padding: 6px 12px;
  font-size: inherit;
  width: 100%;
}

.search-keyboard-shortcuts {
  font-size: 0.8rem;
  opacity: 75%;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

@media (max-width: 1100px) {
  .search-keyboard-shortcuts {
    display: none;
  }
}

.search-keyboard-shortcuts kbd {
  background: rgba(128, 128, 128, 0.1);
  border-radius: 4px;
  padding: 3px 6px;
  min-width: 24px;
  display: inline-block;
  text-align: center;
  vertical-align: middle;
  border: 1px solid rgba(128, 128, 128, 0.15);
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.1);
}

.results {
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow-x: hidden;
  overflow-y: auto;
}

.result {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-radius: 4px;
  background-color: rgba(128, 128, 128, 0.05);
  transition: none;
  line-height: 1rem;
}

.titles {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.title {
  display: flex;
  align-items: center;
  gap: 4px;
}

.title.main {
  font-weight: 500;
}

.title-icon {
  opacity: 0.5;
  font-weight: 500;
  color: var(--vp-c-brand);
}

.title svg {
  opacity: 0.5;
}

.title:not(:last-child) .text {
  opacity: 0.75;
}

.result .description {
  font-size: 0.8rem;
  opacity: 75%;
  color: var(--vp-c-text-1);
}

.result.selected {
  background-color: var(--vp-c-brand);
}


.result.selected,
.result.selected .title-icon,
.result.selected .description {
  color: var(--vp-c-white) !important;
}

.no-results {
  font-size: 0.9rem;
  text-align: center;
  padding: 12px;
}

svg {
  flex: none;
}
</style>
