<script setup lang="ts">
import { useData } from 'vitepress'
import VPDocAsideOutline from './VPDocAsideOutline.vue'
import VPDocAsideCarbonAds from './VPDocAsideCarbonAds.vue'

const { page, theme } = useData()
</script>

<template>
  <div class="VPDocAside">
    <VPDocAsideOutline v-if="page.headers.length" />
    <VPDocAsideCarbonAds v-if="theme.carbonAds" />
  </div>
</template>

<style scoped>
.VPDocAside :deep(.VPDocAsideOutline + .VPDocAsideCarbonAds) {
  margin-top: 24px;
}
</style>
