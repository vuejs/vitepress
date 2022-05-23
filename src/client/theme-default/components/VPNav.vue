<script setup lang="ts">
import { provide } from 'vue'
import { useSidebar } from '../composables/sidebar'
import { useNav } from '../composables/nav'
import { useSidebar } from '../composables/sidebar'
import VPNavBar from './VPNavBar.vue'
import VPNavScreen from './VPNavScreen.vue'

const { isScreenOpen, closeScreen, toggleScreen } = useNav()
const { hasSidebar } = useSidebar()

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

  .VPNav.no-sidebar {
    backdrop-filter: saturate(50%) blur(8px);
  }
}
</style>
