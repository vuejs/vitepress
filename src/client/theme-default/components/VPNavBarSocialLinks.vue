<script lang="ts" setup>
import { useData } from '../composables/data'
import VPSocialLinks from './VPSocialLinks.vue'

const { theme } = useData()
</script>

<template>
  <VPSocialLinks
    v-if="theme.socialLinks"
    class="VPNavBarSocialLinks"
    :links="theme.socialLinks"
  />
</template>

<style scoped>
.VPNavBarSocialLinks {
  display: none;
}

@media (min-width: 80rem) {
  .VPNavBarSocialLinks {
    display: flex;
    align-items: center;
  }
}
</style>
