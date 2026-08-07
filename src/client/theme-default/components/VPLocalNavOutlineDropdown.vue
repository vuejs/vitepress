<script setup lang="ts">
import { onKeyStroke } from '@vueuse/core'
import { onContentUpdated } from 'vitepress'
import type { DefaultTheme } from 'vitepress/theme'
import { nextTick, ref, watch } from 'vue'
import { useData } from '../composables/data'
import { resolveTitle } from '../composables/outline'
import VPDocOutlineItem from './VPDocOutlineItem.vue'

const props = defineProps<{
  headers: DefaultTheme.OutlineItem[]
  navHeight: number
}>()

const { theme } = useData()
const open = ref(false)
const vh = ref(0)
const main = ref<HTMLDivElement>()
const items = ref<HTMLDivElement>()

function closeOnClickOutside(e: Event) {
  if (!main.value?.contains(e.target as Node)) {
    open.value = false
  }
}

watch(open, (value) => {
  if (value) {
    document.addEventListener('click', closeOnClickOutside)
    return
  }
  document.removeEventListener('click', closeOnClickOutside)
})

onKeyStroke('Escape', () => {
  open.value = false
})

onContentUpdated(() => {
  open.value = false
})

function toggle() {
  open.value = !open.value
  vh.value = window.innerHeight + Math.min(window.scrollY - props.navHeight, 0)
}

function onItemClick(e: Event) {
  if ((e.target as HTMLElement).classList.contains('outline-link')) {
    // disable animation on hash navigation when page jumps
    if (items.value) {
      items.value.style.transition = 'none'
    }
    nextTick(() => {
      open.value = false
    })
  }
}

function scrollToTop() {
  open.value = false
  window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
}
</script>

<template>
  <div
    ref="main"
    class="VPLocalNavOutlineDropdown"
    :style="{ '--vp-vh': vh + 'px' }"
    data-allow-mismatch="style"
  >
    <button @click="toggle" :class="{ open }" v-if="headers.length > 0">
      <span class="menu-text">{{ resolveTitle(theme) }}</span>
      <span class="vpi-chevron-right icon" />
    </button>
    <button @click="scrollToTop" v-else>
      {{ theme.returnToTopLabel || 'Return to top' }}
    </button>
    <Transition name="flyout">
      <div v-if="open" ref="items" class="items" @click="onItemClick">
        <div class="header">
          <a class="top-link" href="#" @click="scrollToTop">
            {{ theme.returnToTopLabel || 'Return to top' }}
          </a>
        </div>
        <div class="outline">
          <VPDocOutlineItem :headers />
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.VPLocalNavOutlineDropdown button {
  display: block;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.5rem;
  color: var(--vp-c-text-2);
  transition: color 0.5s;
  position: relative;
}

.VPLocalNavOutlineDropdown button:hover {
  color: var(--vp-c-text-1);
  transition: color 0.25s;
}

.VPLocalNavOutlineDropdown button.open {
  color: var(--vp-c-text-1);
}

.icon {
  display: inline-block;
  vertical-align: middle;
  margin-left: 0.125rem;
  font-size: 0.875rem;
  transform: rotate(0) /*rtl:rotate(180deg)*/;
  transition: transform 0.25s;
}

@media (min-width: 60rem) {
  .VPLocalNavOutlineDropdown button {
    font-size: 0.875rem;
  }

  .icon {
    font-size: 1rem;
  }
}

.open > .icon {
  /*rtl:ignore*/
  transform: rotate(90deg);
}

.items {
  position: absolute;
  top: 2.5rem;
  right: 1rem;
  left: 1rem;
  display: grid;
  gap: 1px;
  border: 1px solid var(--vp-c-border);
  border-radius: 0.5rem;
  background-color: var(--vp-c-gutter);
  max-height: calc(var(--vp-vh, 100vh) - 5.375rem);
  overflow: hidden auto;
  box-shadow: var(--vp-shadow-3);
}

@media (min-width: 60rem) {
  .items {
    right: auto;
    left: calc(var(--vp-sidebar-width) + 2rem);
    width: 20rem;
  }
}

.header {
  background-color: var(--vp-c-bg-soft);
}

.top-link {
  display: block;
  padding: 0 1rem;
  line-height: 3rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--vp-c-brand-1);
}

.outline {
  padding: 0.5rem 0;
  background-color: var(--vp-c-bg-soft);
}

.flyout-enter-active {
  transition: all 0.2s ease-out;
}

.flyout-leave-active {
  transition: all 0.15s ease-in;
}

.flyout-enter-from,
.flyout-leave-to {
  opacity: 0;
  transform: translateY(-1rem);
}
</style>
