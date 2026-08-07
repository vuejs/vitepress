<script lang="ts" setup>
import type { DefaultTheme } from 'vitepress/theme'
import VPNavScreenMenuGroupLink from './VPNavScreenMenuGroupLink.vue'

defineProps<{
  text?: string
  items: DefaultTheme.NavItemWithLink[]
}>()
</script>

<template>
  <div class="VPNavScreenMenuGroupSection">
    <p v-if="text" class="title">{{ text }}</p>
    <ul>
      <li v-for="item in items" :key="item.text">
        <VPNavScreenMenuGroupLink :item="item" />
      </li>
    </ul>
  </div>
</template>

<style scoped>
.VPNavScreenMenuGroupSection {
  display: block;
}

.title {
  line-height: 2rem;
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--vp-c-text-2);
  transition: color 0.25s;
}
</style>
