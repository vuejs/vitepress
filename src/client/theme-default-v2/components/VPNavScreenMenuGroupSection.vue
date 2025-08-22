<script lang="ts" setup>
import type { DefaultTheme } from 'vitepress/theme'
import VPNavScreenMenuGroupLink from './VPNavScreenMenuGroupLink.vue'

defineProps<{
  text?: string
  items: DefaultTheme.NavItemWithLink[]
}>()
</script>

<template>
  <div class="vp-nav-screen-menu-group-section">
    <p v-if="text" class="vp-nav-screen-menu-group-section__title">{{ text }}</p>
    <VPNavScreenMenuGroupLink v-for="item in items" :key="item.text" :item />
  </div>
</template>

<style scoped>
.vp-nav-screen-menu-group-section {
  display: block;
}

.vp-nav-screen-menu-group-section__title {
  line-height: 32px;
  font-size: 12px;
  font-weight: 500;
  color: var(--vp-c-text-2);
  transition: color 0.25s;
}
</style>
