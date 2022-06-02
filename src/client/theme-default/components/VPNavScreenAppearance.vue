<script lang="ts" setup>
import { useData } from 'vitepress'
import VPSwitchAppearance from './VPSwitchAppearance.vue'

const { site } = useData()
</script>

<template>
  <div v-if="site.appearance" class="VPNavScreenAppearance">
    <p class="text">Appearance</p>
    <VPSwitchAppearance />
  </div>
</template>

<style scoped>
.VPNavScreenAppearance {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 8px;
  padding: .75rem .875rem .75rem 1rem;
  background-color: var(--vp-c-bg-soft);
  transition: background-color 0.5s;
}

.text {
  line-height: 1.5rem;
  font-size: .75rem;
  font-weight: 500;
  color: var(--vp-c-text-2);
  transition: color 0.5s;
}
</style>
