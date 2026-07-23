<script lang="ts" setup>
import { useData } from '../composables/data'
import VPSwitchAppearance from './VPSwitchAppearance.vue'

const { site, theme } = useData()
</script>

<template>
  <div
    v-if="
      site.appearance &&
      site.appearance !== 'force-dark' &&
      site.appearance !== 'force-auto'
    "
    class="VPNavScreenAppearance"
  >
    <p class="text">
      {{ theme.darkModeSwitchLabel || 'Appearance' }}
    </p>
    <VPSwitchAppearance />
  </div>
</template>

<style scoped>
.VPNavScreenAppearance {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 0.5rem;
  padding: 0.75rem 0.875rem 0.75rem 1rem;
  background-color: var(--vp-c-bg-soft);
}

.text {
  line-height: 1.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--vp-c-text-2);
}
</style>
