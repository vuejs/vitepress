<script lang="ts" setup generic="T extends (DefaultTheme.NavItemComponent | DefaultTheme.NavItemChildren | DefaultTheme.NavItemWithLink)">
import type { DefaultTheme } from 'vitepress/theme'
import VPMenuLink from './VPMenuLink.vue'

defineProps<{
  text?: string
  items: T[]
}>()
</script>

<template>
  <div class="VPMenuGroup">
    <p v-if="text" class="title">{{ text }}</p>

    <template v-for="item in items" :key="JSON.stringify(item)">
      <VPMenuLink v-if="'link' in item" :item />
    </template>
  </div>
</template>

<style scoped>
.VPMenuGroup {
  margin: 0.75rem -0.75rem 0;
  border-top: 1px solid var(--vp-c-divider);
  padding: 0.75rem 0.75rem 0;
}

.VPMenuGroup:first-child {
  margin-top: 0;
  border-top: 0;
  padding-top: 0;
}

.VPMenuGroup + .VPMenuGroup {
  margin-top: 0.75rem;
  border-top: 1px solid var(--vp-c-divider);
}

.title {
  padding: 0 0.75rem;
  line-height: 2rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
  white-space: nowrap;
  transition: color 0.25s;
}
</style>
