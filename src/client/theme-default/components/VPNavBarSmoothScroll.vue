<script lang="ts" setup>
import { useData } from 'vitepress'
import VPSwitchSmoothScroll from './VPSwitchSmoothScroll.vue'
const { site } = useData()
</script>

<template>
  <div v-if="site.smoothScroll" class="VPSwitchSmoothScroll">
    <VPSwitchSmoothScroll />
  </div>
</template>

<style scoped>
.VPSwitchSmoothScroll {
  display: none;
}
@media (min-width: 1280px) {
  .VPSwitchSmoothScroll {
    display: flex;
    align-items: center;
  }
}
</style>
