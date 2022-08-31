<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

const VPCarbonAds = __CARBON__
  ? defineAsyncComponent(() => import('./VPCarbonAds.vue'))
  : () => null
</script>

<template>
  <div class="VPDocAsideCarbonAds">
    <VPCarbonAds />
  </div>
</template>
