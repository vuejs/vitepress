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
  border-radius: 8px;
  padding-block: 12px;
  padding-inline: 16px 14px;
  background-color: var(--vp-c-bg-soft);
}

.text {
  line-height: 24px;
  font-size: 12px;
  font-weight: 500;
  color: var(--vp-c-text-2);
}
</style>
