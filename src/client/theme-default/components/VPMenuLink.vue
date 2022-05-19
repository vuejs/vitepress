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
  padding: 0 16px;
  line-height: 28px;
  font-size: 13px;
  font-weight: 500;
  color: var(--vp-c-text-1);
  white-space: nowrap;
  transition: color 0.25s;
}

.VPMenuLink:hover {
  color: var(--vp-c-brand);
}
</style>
