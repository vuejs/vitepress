<script setup lang="ts">
import type { DefaultTheme } from 'vitepress/theme'
import { defineAsyncComponent } from 'vue'

defineProps<{
  carbonAds: DefaultTheme.CarbonAdsOptions
}>()

const VPCarbonAds = __CARBON__
  ? defineAsyncComponent(() => import('./VPCarbonAds.vue'))
  : () => null
</script>

<template>
  <div class="VPDocAsideCarbonAds">
    <VPCarbonAds :carbon-ads="carbonAds" />
  </div>
</template>
