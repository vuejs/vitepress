<script setup lang="ts">
import type { DefaultTheme } from 'vitepress/theme'
import { defineAsyncComponent } from 'vue'

const props = defineProps<{
  carbonAds: DefaultTheme.CarbonAdsOptions
}>()

const VPCarbonAds = __CARBON__
  ? defineAsyncComponent(() => import('./VPCarbonAds.vue'))
  : () => null
</script>

<template>
  <div class="VPDocAsideCarbonAds">
    <VPCarbonAds :carbonAds="props" />
  </div>
</template>
