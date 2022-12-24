<script setup lang="ts">
import { useData } from 'vitepress';
import { defineAsyncComponent } from 'vue'

const VPCarbonAds = __CARBON__
  ? defineAsyncComponent(() => import('./VPCarbonAds.vue'))
  : () => null

const { page } = useData()
</script>

<template>
  <div class="VPDocAsideCarbonAds">
    <VPCarbonAds :key="page.relativePath" />
  </div>
</template>
