<script setup lang="ts">
import { defineAsyncComponent, defineVaporAsyncComponent } from 'vue'
import type { DefaultTheme } from 'vitepress/theme'

defineProps<{
  carbonAds: DefaultTheme.CarbonAdsOptions
}>()

const inVaporMode = !import.meta.env.SSR && __VAPOR__

const VPCarbonAds = __CARBON__
  ? inVaporMode
    ? defineVaporAsyncComponent(() => import('./VPCarbonAds.vue') as any)
    : defineAsyncComponent(() => import('./VPCarbonAds.vue'))
  : () => null
</script>

<template>
  <div class="VPDocAsideCarbonAds">
    <VPCarbonAds :carbon-ads="carbonAds" />
  </div>
</template>
