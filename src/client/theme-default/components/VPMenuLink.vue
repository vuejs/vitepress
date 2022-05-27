<script lang="ts" setup>
import VPLink from './VPLink.vue'

defineProps<{
  item: any
}>()
</script>

<template>
  <VPLink class="VPMenuLink" :href="item.link">
    {{ item.text }}
  </VPLink>
</template>

<style scoped>
.VPMenuLink {
  display: block;
  border-radius: 6px;
  padding: 0 24px 0 12px;
  line-height: 32px;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-1);
  white-space: nowrap;
  transition: background-color 0.25s, color 0.25s;
}

.VPMenuLink:hover {
  color: var(--vp-c-brand);
  background-color: var(--vp-c-bg-soft);
}
</style>
