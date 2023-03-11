<script lang="ts" setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vitepress'
import { onKeyStroke } from '@vueuse/core'

defineEmits<{
  (e: 'close'): void
}>()

/* Search */

interface Result {
  text: string
  description: string
  link: string
}

const filterText = ref('')

const results = computed<Result[]>(() => [])

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

function scrollToSelectedPackage () {
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
  scrollToSelectedPackage()
})

onKeyStroke('ArrowDown', (event) => {
  event.preventDefault()
  selectedIndex.value++
  if (selectedIndex.value >= results.value.length) {
    selectedIndex.value = 0
  }
  disableMouseOver.value = true
  scrollToSelectedPackage()
})

const router = useRouter()

onKeyStroke('Enter', () => {
  const selectedPackage = results.value[selectedIndex.value]
  if (selectedPackage) {
    router.go(selectedPackage.link)
  }
})
</script>

<template>
  <Teleport to="body">
    <div class="VPOfflineSearchBox" aria-modal="true">
      <div class="backdrop" @click="$emit('close')" />

      <div class="shell">
        <div class="search-bar" @click="focusSearchInput()">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21l-4.35-4.35"/></g></svg>
          <input
            ref="searchInput"
            v-model="filterText"
            placeholder="Search..."
            class="search-input"
          >
        </div>

        <div
          class="results"
          @mousemove="disableMouseOver = false"
        >
          <a
            v-for="(p, index) in results"
            :key="p.text"
            :href="p.link"
            class="result"
            :class="{
              selected: selectedIndex === index,
            }"
            @mouseenter="!disableMouseOver && (selectedIndex = index)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="m16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M3.29 7L12 12l8.71-5M12 22V12"/></g></svg>
            <div>
              <div>{{ p.text }}</div>
              <div v-if="p.description" class="description">{{ p.description }}</div>
            </div>
          </a>
        </div>

        <div class="search-keyboard-shortcuts">
          Use <kbd>↑</kbd> and <kbd>↓</kbd> to navigate the list and <kbd>Enter</kbd> to select a result.
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped lang="postcss">
.VPOfflineSearchBox {
  position: absolute;
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
  padding: 0 12px;
  opacity: 75%;
}

@media (max-width: 1100px) {
  .search-keyboard-shortcuts {
    display: none;
  }
}

.search-keyboard-shortcuts kbd {
  background: rgba(128, 128, 128, 0.1);
  border-radius: 4px;
  padding: 0px 6px;
  min-width: 24px;
  display: inline-block;
  text-align: center;
}

.results {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.result {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 4px;
  background-color: rgba(128, 128, 128, 0.05);
  transition: none;
  line-height: 1rem;

  .description {
    font-size: 0.8rem;
    opacity: 75%;
    color: var(--vp-c-text-1);
  }

  &.selected {
    background-color: var(--vp-c-brand);
    &, .description {
      color: var(--vp-c-white) !important;
    }
  }
}

svg {
  flex: none;
}
</style>
