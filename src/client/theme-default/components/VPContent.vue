<script setup lang="ts">
import { useRoute } from 'vitepress'
import { useSidebar } from '../composables/sidebar'
import NotFound from '../NotFound.vue'
import VPContentDoc from './VPContentDoc.vue'

const route = useRoute()
const { hasSidebar } = useSidebar()
</script>

<template>
  <div
    class="VPContent"
    id="VPContent"
    :class="{ 'has-sidebar': hasSidebar }"
  >
    <NotFound v-if="route.component === NotFound" />
    <VPContentDoc v-else :class="{ 'has-sidebar': hasSidebar }" />
  </div>
</template>

<style scoped>
@media (max-width: 768px) {
  .VPContent {
    overflow-x: hidden;
  }
}

@media (min-width: 960px) {
  .VPContent {
    padding-top: var(--vp-nav-height-desktop);
  }

  .VPContent.has-sidebar {
    padding-left: var(--vp-sidebar-width);
  }
}

@media (min-width: 1440px) {
  .VPContent.has-sidebar {
    padding-left: calc((100vw - var(--vp-layout-max-width)) / 2 + var(--vp-sidebar-width) - 32px);
  }
}
</style>
