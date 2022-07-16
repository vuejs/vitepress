<script lang="ts" setup>
import { useData } from 'vitepress'
import VPSwitchSmoothScroll from './VPSwitchSmoothScroll.vue'

const { site } = useData()
</script>

<template>
  <div v-if="site.smoothScroll" class="VPNavScreenSmoothScroll">
    <p class="text">Smooth scroll</p>
    <VPSwitchSmoothScroll screen />
  </div>
</template>

<style scoped>
.VPNavScreenSmoothScroll {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 8px;
  padding: 12px 14px 12px 16px;
  background-color: var(--vp-c-bg-soft);
}

.text {
  line-height: 24px;
  font-size: 12px;
  font-weight: 500;
  color: var(--vp-c-text-2);
  transition: color 0.5s;
}
</style>
