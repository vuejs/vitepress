<script setup lang="ts">
import { computed, provide } from 'vue'
import { useWindowScroll } from '@vueuse/core'
import { useNav } from '../composables/nav.js'
import { useSidebar } from '../composables/sidebar.js'
import VPNavBar from './VPNavBar.vue'
import VPNavScreen from './VPNavScreen.vue'

const { y } = useWindowScroll()

const { isScreenOpen, closeScreen, toggleScreen } = useNav()
const { hasSidebar } = useSidebar()

provide('close-screen', closeScreen)

const classes = computed(() => ({
  'no-sidebar': !hasSidebar.value,
  'fill-bg': y.value > 0
}))
</script>

<template>
  <header class="VPNav" :class="classes">
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
  background-color: var(--vp-nav-bg-color);
  pointer-events: none;
  transition: background-color 0.5s;
}

.VPNav.no-sidebar {
  background-color: transparent;
}

.VPNav.fill-bg {
  background-color: var(--vp-nav-bg-color);
}

@media (min-width: 960px) {
  .VPNav {
    position: fixed;
  }
}
</style>
