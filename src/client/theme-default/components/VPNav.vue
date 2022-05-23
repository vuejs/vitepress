<script setup lang="ts">
import { provide } from 'vue'
import { useData } from 'vitepress'
import { useNav } from '../composables/nav'
import VPNavBar from './VPNavBar.vue'
import VPNavScreen from './VPNavScreen.vue'
import { useSidebar } from '../composables/sidebar'

const { frontmatter } = useData()
const { hasSidebar } = useSidebar()
const { isScreenOpen, closeScreen, toggleScreen } = useNav()

provide('close-screen', closeScreen)
</script>

<template>
  <header class="VPNav" :class="{ 'no-sidebar' : !hasSidebar }">
    <VPNavBar :is-screen-open="isScreenOpen" @toggle-screen="toggleScreen" />
    <VPNavScreen :open="isScreenOpen" />
  </header>
</template>

<style scoped>
.VPNav {
  position: relative;
  top: 0;
  left: 0;
  z-index: var(--vp-z-index-nav);
  width: 100%;
}

@media (min-width: 960px) {
  .VPNav {
    position: fixed;
  }
}

@media (min-width: 960px) {
  .no-sidebar {
    backdrop-filter: saturate(50%) blur(8px);
  }
}
</style>
