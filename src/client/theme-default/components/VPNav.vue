<script setup lang="ts">
import { provide, watchEffect, computed } from 'vue'
import { useNav } from '../composables/nav'
import VPNavBar from './VPNavBar.vue'
import VPNavScreen from './VPNavScreen.vue'
import { useData } from '../composables/data'

const { isScreenOpen, closeScreen, toggleScreen } = useNav()
const { frontmatter } = useData()

const hasNavbar = computed(() => {
  return frontmatter.value.navbar !== false
})

provide('close-screen', closeScreen)

watchEffect(() => {
  if (hasNavbar.value) {
    document.documentElement.style.removeProperty('--vp-nav-height')
  } else {
    document.documentElement.style.setProperty('--vp-nav-height', '0')
  }
})
</script>

<template>
  <header v-if="hasNavbar" class="VPNav">
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
  /*rtl:ignore*/
  left: 0;
  z-index: var(--vp-z-index-nav);
  width: 100%;
  pointer-events: none;
  transition: background-color 0.5s;
}

@media (min-width: 960px) {
  .VPNav {
    position: fixed;
  }
}
</style>
