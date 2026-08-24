<script lang="ts" setup>
import { useWindowScroll } from '@vueuse/core'
import { computed, onMounted, ref } from 'vue'

import { useData } from '../composables/data'
import { useLayout } from '../composables/layout'
import VPLocalNavOutlineDropdown from './VPLocalNavOutlineDropdown.vue'

defineProps<{
  open: boolean
}>()

defineEmits<{
  (e: 'open-menu'): void
}>()

const { theme } = useData()
const { isHome, hasSidebar, headers, hasLocalNav } = useLayout()
const { y } = useWindowScroll()

const navHeight = ref(0)

onMounted(() => {
  // getComputedStyle returns custom properties as their raw token ("4rem"),
  // so resolve the height by measuring instead of parsing
  const probe = document.createElement('div')
  probe.style.cssText =
    'position: absolute; visibility: hidden; height: var(--vp-nav-height)'
  document.body.appendChild(probe)
  navHeight.value = probe.offsetHeight
  probe.remove()
})

const isScrolled = computed(() => y.value >= navHeight.value)
</script>

<template>
  <div
    v-if="!isHome && (hasLocalNav || hasSidebar || isScrolled)"
    class="VPLocalNav"
    :class="{
      'has-sidebar': hasSidebar,
      'empty': !hasLocalNav,
      'fixed': !hasLocalNav && !hasSidebar
    }"
  >
    <div class="container">
      <button
        v-if="hasSidebar"
        type="button"
        class="menu"
        :aria-expanded="open"
        aria-controls="VPSidebarNav"
        @click="$emit('open-menu')"
      >
        <span class="vpi-align-left menu-icon" aria-hidden="true"></span>
        <span class="menu-text">
          {{ theme.sidebarMenuLabel || 'Menu' }}
        </span>
      </button>

      <VPLocalNavOutlineDropdown :headers :navHeight />
    </div>
  </div>
</template>

<style scoped>
.VPLocalNav {
  position: sticky;
  top: 0;
  /*rtl:ignore*/
  left: 0;
  z-index: var(--vp-z-index-local-nav);
  border-bottom: 1px solid var(--vp-c-gutter);
  padding-top: var(--vp-layout-top-height, 0px);
  width: 100%;
}

/* the background surface — below 60rem it covers just this bar; from 60rem
   the bar is pinned under the fixed navbar, so the surface extends up
   behind it and one element carries the backdrop filter for both bars
   (two stacked filters would show a seam at their shared edge) */
.VPLocalNav::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background-color: var(--vp-local-nav-bg-color);
  backdrop-filter: var(--vp-nav-backdrop-filter);
  transition: background-color 0.25s;
}

.VPLocalNav.fixed {
  position: fixed;
}

@media (min-width: 60rem) {
  .VPLocalNav {
    top: var(--vp-nav-height);
  }

  .VPLocalNav::before {
    top: calc(-1 * var(--vp-nav-height));
  }

  .VPLocalNav.has-sidebar {
    padding-left: var(--vp-sidebar-width);
  }

  .VPLocalNav.empty {
    display: none;
  }
}

@media (min-width: 80rem) {
  .VPLocalNav {
    display: none;
  }
}

.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.menu {
  display: flex;
  align-items: center;
  line-height: 2;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--vp-c-text-2);
  transition: color 0.5s;
}

.menu:hover {
  color: var(--vp-c-text-1);
  transition: color 0.25s;
}

@media (min-width: 60rem) {
  .menu {
    display: none;
  }
}

.menu-icon {
  margin-right: 0.5rem;
  font-size: 0.875rem;
}

.menu,
:deep(.VPLocalNavOutlineDropdown > button) {
  padding: 0.75rem 1.5rem 0.6875rem;
}

@media (min-width: 48rem) {
  .menu,
  :deep(.VPLocalNavOutlineDropdown > button) {
    padding: 0.75rem 2rem 0.6875rem;
  }
}
</style>
