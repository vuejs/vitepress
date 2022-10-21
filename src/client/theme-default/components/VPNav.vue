<script setup lang="ts">
import { provide } from 'vue'
import { useNav } from '../composables/nav.js'
import { useSidebar } from '../composables/sidebar.js'
import VPNavBar from './VPNavBar.vue'
import VPNavScreen from './VPNavScreen.vue'

const { isScreenOpen, closeScreen, toggleScreen } = useNav()
const { hasSidebar } = useSidebar()

provide('close-screen', closeScreen)
</script>

<template>
  <header class="VPNav" :class="{ 'no-sidebar' : !hasSidebar }">
    <VPNavBar :is-screen-open="isScreenOpen" @toggle-screen="toggleScreen">
      <template #nav-bar-title-before><slot name="nav-bar-title-before" /></template>
      <template #nav-bar-title-after><slot name="nav-bar-title-after" /></template>
      <template #nav-bar-content-before><slot name="nav-bar-content-before" /></template>
      <template #nav-bar-content-after><slot name="nav-bar-content-after" /></template>
    </VPNavBar>
    <VPNavScreen :open="isScreenOpen">
      <template #nav-screen-content-before><slot name="nav-screen-content-before" /></template>
      <template #nav-screen-content-after><slot name="nav-screen-content-after" /></template>
    </VPNavScreen>
  </header>
</template>

<style scoped>
.VPNav {
  position: relative;
  top: var(--vp-layout-top-height, 0px);
  left: 0;
  z-index: var(--vp-z-index-nav);
  width: 100%;
  pointer-events: none;
}

@media (min-width: 960px) {
  .VPNav {
    position: fixed;
  }

  .VPNav.no-sidebar {
    -webkit-backdrop-filter: saturate(50%) blur(8px);
    backdrop-filter: saturate(50%) blur(8px);
    background: rgba(255, 255, 255, 0.7);
  }

  .dark .VPNav.no-sidebar {
    background: rgba(36, 36, 36, 0.7);
  }

  @supports not (backdrop-filter: saturate(50%) blur(8px)) {
    .VPNav.no-sidebar {
      background: rgba(255, 255, 255, 0.95);
    }

    .dark .VPNav.no-sidebar {
      background: rgba(36, 36, 36, 0.95);
    }
  }
}
</style>
