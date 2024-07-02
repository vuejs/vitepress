<script lang="ts" setup>
import { useData } from 'vitepress'
import VPSwitchAppearance from 'vitepress/dist/client/theme-default/components/VPSwitchAppearance.vue'

defineProps<{ text: string; screenMenu?: boolean }>()

const { site, theme } = useData()
</script>

<template>
  <div
    v-if="site.appearance && site.appearance !== 'force-dark'"
    class="CustomAppearance"
    :class="{ mobile: screenMenu }"
  >
    <p class="text">
      {{ text || theme.darkModeSwitchLabel || 'Appearance' }}
    </p>
    <VPSwitchAppearance />
  </div>
</template>

<style scoped>
.CustomAppearance {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 8px;
  padding: 12px 14px 12px 16px;
  min-width: 200px;
}
.CustomAppearance.mobile {
  background-color: var(--vp-c-bg-soft);
}

.text {
  line-height: 24px;
  font-size: 12px;
  font-weight: 500;
  color: var(--vp-c-text-2);
}
</style>
