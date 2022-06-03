<script lang="ts" setup>
import { useData } from 'vitepress'
import VPSocialLinks from './VPSocialLinks.vue'
import { useSidebar } from '../composables/sidebar'

const { theme } = useData()
const { hasSidebar } = useSidebar()
</script>

<template>
  <VPSocialLinks
    v-if="theme.socialLinks"
    :class="{
      'VPNavBarSocialLinks' : true,
      'has-sidebar' : hasSidebar
    }"
    :links="theme.socialLinks"
  />
</template>

<style scoped>
.VPNavBarSocialLinks {
  display: none;
}

@media (min-width: 1280px) {
  .VPNavBarSocialLinks {
    display: flex;
    align-items: center;
  }
}

.has-sidebar {
  padding-right: 32px;
}
</style>
