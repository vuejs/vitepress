<script lang="ts" setup>
import localSearchIndex from '@localSearchIndex'
import {
  computedAsync,
  debouncedWatch,
  onKeyStroke,
  useEventListener,
  useLocalStorage,
  useSessionStorage
} from '@vueuse/core'
import MiniSearch, { type SearchResult } from 'minisearch'
import { useRouter } from 'vitepress'
import {
  createApp,
  markRaw,
  nextTick,
  onMounted,
  ref,
  shallowRef,
  watch,
  type Ref
} from 'vue'
import type { ModalTranslations } from '../../../../types/local-search'
import { pathToFile, withBase } from '../../app/utils'
import { useData } from '../composables/data'
import { createTranslate } from '../support/translation'

defineProps<{
  placeholder: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const el = ref<HTMLDivElement>()

/* Search */

const searchIndexData = shallowRef(localSearchIndex)

// hmr
if (import.meta.hot) {
  import.meta.hot.accept('/@localSearchIndex', (m) => {
    if (m) {
      searchIndexData.value = m.default
    }
  })
}

interface Result {
  title: string
  titles: string[]
  text?: string
}

const { localeIndex } = useData()

const searchIndex = computedAsync(async () =>
  markRaw(
    MiniSearch.loadJSON<Result>(
      (await searchIndexData.value[localeIndex.value]?.())?.default,
      {
        fields: ['title', 'titles', 'text'],
        storeFields: ['title', 'titles'],
        searchOptions: {
          fuzzy: 0.2,
          prefix: true,
          boost: { title: 4, text: 2, titles: 1 }
        }
      }
    )
  )
)

const filterText = useSessionStorage('vitepress:local-search-filter', '')

const showDetailedList = useLocalStorage(
  'vitepress:local-search-detailed-list',
  false
)

const results: Ref<(SearchResult & Result)[]> = shallowRef([])

const contents = shallowRef(new Map<string, Map<string, string>>())

const headingRegex = /<h(\d*).*?>.*?<a.*? href="#(.*?)".*?>.*?<\/a><\/h\1>/gi

const enableNoResults = ref(false)

watch(filterText, () => {
  enableNoResults.value = false
})

debouncedWatch(
  () => [searchIndex.value, filterText.value, showDetailedList.value] as const,
  async ([index, filterTextValue, showDetailedListValue], old, onCleanup) => {
    let canceled = false
    onCleanup(() => {
      canceled = true
    })

    if (!index) return

    // Search
    results.value = index
      .search(filterTextValue)
      .slice(0, 16) as (SearchResult & Result)[]
    enableNoResults.value = true

    // Highlighting
    const mods = showDetailedListValue
      ? await Promise.all(results.value.map((r) => fetchExcerpt(r.id)))
      : []
    if (canceled) return
    const c = new Map<string, Map<string, string>>()
    for (const { id, mod } of mods) {
      const comp = mod.default ?? mod
      if (comp?.render) {
        const app = createApp(comp)
        // Silence warnings about missing components
        app.config.warnHandler = () => {}
        const div = document.createElement('div')
        app.mount(div)
        const sections = div.innerHTML.split(headingRegex)
        app.unmount()
        sections.shift()
        const mapId = id.slice(0, id.indexOf('#'))
        let map = c.get(mapId)
        if (!map) {
          map = new Map()
          c.set(mapId, map)
        }
        for (let i = 0; i < sections.length; i += 3) {
          const anchor = sections[i + 1]
          const html = sections[i + 2]
          map.set(anchor, html)
        }
      }
      if (canceled) return
    }
    results.value = results.value.map((r) => {
      let title = r.title
      let titles = r.titles
      let text = ''

      // Highlight in text
      const [id, anchor] = r.id.split('#')
      const map = c.get(id)
      if (map) {
        text = map.get(anchor) ?? ''
      }

      for (const term in r.match) {
        const match = r.match[term]
        const reg = new RegExp(term, 'gi')
        if (match.includes('title')) {
          title = title.replace(reg, `<mark>$&</mark>`)
        }
        if (match.includes('titles')) {
          titles = titles.flatMap((t) =>
            t ? [t.replace(reg, `<mark>$&</mark>`)] : []
          )
        }
        if (showDetailedListValue && match.includes('text')) {
          text = text.replace(reg, `<mark>$&</mark>`)
        }
      }

      return {
        ...r,
        title,
        titles,
        text
      }
    })
    contents.value = c

    await nextTick()
    const excerpts = el.value?.querySelectorAll('.result .excerpt') ?? []
    for (const excerpt of excerpts) {
      excerpt.querySelector('mark')?.scrollIntoView({
        block: 'center'
      })
    }
  },
  { debounce: 200, immediate: true }
)

async function fetchExcerpt(id: string) {
  const file = pathToFile(withBase(id.slice(0, id.indexOf('#'))))
  try {
    return { id, mod: await import(/*@vite-ignore*/ file) }
  } catch (e) {
    console.error(e)
    return { id, mod: {} }
  }
}

/* Search input focus */

const searchInput = ref<HTMLInputElement>()

function focusSearchInput() {
  searchInput.value?.focus()
  searchInput.value?.select()
}

onMounted(() => {
  focusSearchInput()
})

function onSearchBarClick(event: PointerEvent) {
  if (event.pointerType === 'mouse') {
    focusSearchInput()
  }
}

/* Search keyboard selection */

const selectedIndex = ref(0)
const disableMouseOver = ref(false)

watch(results, () => {
  selectedIndex.value = 0
  scrollToSelectedResult()
})

function scrollToSelectedResult() {
  nextTick(() => {
    const selectedEl = document.querySelector('.result.selected')
    if (selectedEl) {
      selectedEl.scrollIntoView({
        block: 'nearest'
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

const defaultTranslations: { modal: ModalTranslations } = {
  modal: {
    displayDetails: 'Display detailed list',
    resetButtonTitle: 'Reset search',
    backButtonTitle: 'Close search',
    noResultsText: 'No results for',
    footer: {
      selectText: 'to select',
      selectKeyAriaLabel: 'enter',
      navigateText: 'to navigate',
      navigateUpKeyAriaLabel: 'up arrow',
      navigateDownKeyAriaLabel: 'down arrow'
    }
  }
}

const $t = createTranslate(theme.value.search?.options, defaultTranslations)

// Back

onMounted(() => {
  // Prevents going to previous site
  window.history.pushState(null, '', null)
})

useEventListener('popstate', (event) => {
  event.preventDefault()
  emit('close')
})
</script>

<template>
  <Teleport to="body">
    <div ref="el" class="VPLocalSearchBox" aria-modal="true">
      <div class="backdrop" @click="$emit('close')" />

      <div class="shell">
        <div class="search-bar" @pointerup="onSearchBarClick($event)">
          <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <g
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21l-4.35-4.35" />
            </g>
          </svg>
          <div class="search-actions before">
            <button
              class="back-button"
              :title="$t('modal.backButtonTitle')"
              @click="$emit('close')"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 12H5m7 7l-7-7l7-7"
                />
              </svg>
            </button>
          </div>
          <input
            ref="searchInput"
            v-model="filterText"
            :placeholder="placeholder"
            class="search-input"
          />
          <div class="search-actions">
            <button
              class="toggle-layout-button"
              :class="{
                'detailed-list': showDetailedList
              }"
              :title="$t('modal.displayDetails')"
              @click="showDetailedList = !showDetailedList"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 14h7v7H3zM3 3h7v7H3zm11 1h7m-7 5h7m-7 6h7m-7 5h7"
                />
              </svg>
            </button>

            <button
              class="clear-button"
              :title="$t('modal.resetButtonTitle')"
              @click="filterText = ''"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M20 5H9l-7 7l7 7h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Zm-2 4l-6 6m0-6l6 6"
                />
              </svg>
            </button>
          </div>
        </div>

        <div class="results" @mousemove="disableMouseOver = false">
          <a
            v-for="(p, index) in results"
            :key="p.id"
            :href="p.id"
            class="result"
            :class="{
              selected: selectedIndex === index
            }"
            :aria-title="[...p.titles, p.title].join(' > ')"
            @mouseenter="!disableMouseOver && (selectedIndex = index)"
            @click="$emit('close')"
          >
            <div>
              <div class="titles">
                <span class="title-icon">#</span>
                <span v-for="(t, index) in p.titles" :key="index" class="title">
                  <span class="text" v-html="t" />
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path
                      fill="none"
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="m9 18l6-6l-6-6"
                    />
                  </svg>
                </span>
                <span class="title main">
                  <span class="text" v-html="p.title" />
                </span>
              </div>

              <div v-if="showDetailedList" class="excerpt-wrapper">
                <div v-if="p.text" class="excerpt">
                  <div class="vp-doc" v-html="p.text" />
                </div>
                <div class="excerpt-gradient-bottom" />
                <div class="excerpt-gradient-top" />
              </div>
            </div>
          </a>

          <div
            v-if="filterText && !results.length && enableNoResults"
            class="no-results"
          >
            {{ $t('modal.noResultsText') }} "<strong>{{ filterText }}</strong
            >"
          </div>
        </div>

        <div class="search-keyboard-shortcuts">
          <span>
            <kbd :aria-title="$t('modal.footer.navigateUpKeyAriaLabel')">
              <svg width="14" height="14" viewBox="0 0 24 24">
                <path
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 19V5m-7 7l7-7l7 7"
                />
              </svg>
            </kbd>
            {{ ' ' }}
            <kbd :aria-title="$t('modal.footer.navigateDownKeyAriaLabel')">
              <svg width="14" height="14" viewBox="0 0 24 24">
                <path
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 5v14m7-7l-7 7l-7-7"
                />
              </svg>
            </kbd>
            {{ $t('modal.footer.navigateText') }}
          </span>
          <span>
            <kbd :aria-title="$t('modal.footer.selectKeyAriaLabel')"
              ><svg width="14" height="14" viewBox="0 0 24 24">
                <g
                  fill="none"
                  stroke="currentcolor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                >
                  <path d="m9 10l-5 5l5 5" />
                  <path d="M20 4v7a4 4 0 0 1-4 4H4" />
                </g>
              </svg>
            </kbd>
            {{ $t('modal.footer.selectText') }}
          </span>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped lang="postcss">
.VPLocalSearchBox {
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
  width: min(100vw - 60px, 900px);
  height: min-content;
  max-height: min(100vh - 128px, 900px);
  border-radius: 6px;
}

@media (max-width: 768px) {
  .shell {
    margin: 0;
    width: 100vw;
    height: 100vh;
    max-height: none;
    border-radius: 0;
  }
}

.search-bar {
  border: 1px solid rgba(128, 128, 128, 0.2);
  border-radius: 4px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  cursor: text;
}

@media (max-width: 768px) {
  .search-bar {
    padding: 0 8px;
  }
}

.search-bar:focus-within {
  border-color: var(--vp-c-brand);
}

@media (max-width: 768px) {
  .search-icon {
    display: none;
  }
}

.search-input {
  padding: 6px 12px;
  font-size: inherit;
  width: 100%;
}

@media (max-width: 768px) {
  .search-input {
    padding: 6px 4px;
  }
}

.search-actions {
  display: flex;
  gap: 4px;
}

@media (any-pointer: coarse) {
  .search-actions {
    gap: 8px;
  }
}

@media (min-width: 769px) {
  .search-actions.before {
    display: none;
  }
}

.search-actions button {
  padding: 8px;
}

.search-actions button:hover,
.toggle-layout-button.detailed-list {
  color: var(--vp-c-brand);
}

.search-keyboard-shortcuts {
  font-size: 0.8rem;
  opacity: 75%;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

@media (max-width: 768px) {
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
  overscroll-behavior: contain;
}

.result {
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 4px;
  transition: none;
  line-height: 1rem;
  border: solid 2px rgba(128, 128, 128, 0.05);
}

.result > div {
  margin: 12px;
  width: 100%;
  overflow: hidden;
}

@media (max-width: 768px) {
  .result > div {
    margin: 8px;
  }
}

.titles {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  position: relative;
  z-index: 1001;
  padding: 2px 0;
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

.result.selected {
  border-color: var(--vp-c-brand);
}

.excerpt-wrapper {
  position: relative;
}

.excerpt {
  opacity: 75%;
  pointer-events: none;
  max-height: 140px;
  overflow: hidden;
  position: relative;
  opacity: 0.5;
  margin-top: 4px;
}

.result.selected .excerpt {
  opacity: 1;
}

.excerpt :deep(*) {
  font-size: 0.8rem !important;
  line-height: 130% !important;
}

.titles :deep(mark),
.excerpt :deep(mark) {
  background-color: var(--vp-c-highlight-bg);
  color: var(--vp-c-highlight-text);
  border-radius: 2px;
}

.excerpt :deep(.vp-code-group) .tabs {
  display: none;
}

.excerpt :deep(.vp-code-group) div[class*='language-'] {
  border-radius: 8px !important;
}

.excerpt-gradient-bottom {
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 8px;
  background: linear-gradient(transparent, var(--vp-c-bg));
  z-index: 1000;
}

.excerpt-gradient-top {
  position: absolute;
  top: -1px;
  left: 0;
  width: 100%;
  height: 8px;
  background: linear-gradient(var(--vp-c-bg), transparent);
  z-index: 1000;
}

.result.selected .titles,
.result.selected .title-icon {
  color: var(--vp-c-brand) !important;
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
