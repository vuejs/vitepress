<script setup lang="ts">
import { useRoute, useData } from 'vitepress'
import { useSidebar } from '../composables/sidebar'
import NotFound from '../NotFound.vue'
import VPPage from './VPPage.vue'
import VPHome from './VPHome.vue'
import VPDoc from './VPDoc.vue'

const route = useRoute()
const { frontmatter } = useData()
const { hasSidebar } = useSidebar()
</script>

<template>
  <div
    class="VPContent"
    id="VPContent"
    :class="{ 'has-sidebar': hasSidebar }"
  >
    <NotFound v-if="route.component === NotFound" />
    <VPPage v-else-if="frontmatter.layout === 'page'" />
    <VPHome v-else-if="frontmatter.layout === 'home'" />
    <VPDoc v-else :class="{ 'has-sidebar': hasSidebar }" />
  </div>
</template>

<style scoped>
.VPContent {
  margin: 0 auto;
  max-width: var(--vp-layout-max-width);
}

@media (max-width: 768px) {
  .VPContent {
    overflow-x: hidden;
  }
}

@media (min-width: 960px) {
  .VPContent {
    padding-top: var(--vp-nav-height);
  }

  .VPContent.has-sidebar {
    margin: 0;
    padding-left: var(--vp-sidebar-width);
    max-width: 100%;
  }
}

@media (min-width: 1440px) {
  .VPContent.has-sidebar {
    padding-right: calc((100vw - var(--vp-layout-max-width)) / 2);
    padding-left: calc((100vw - var(--vp-layout-max-width)) / 2 + var(--vp-sidebar-width) - 32px);
  }
}
</style>
