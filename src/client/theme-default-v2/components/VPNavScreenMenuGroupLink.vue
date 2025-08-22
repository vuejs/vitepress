<script lang="ts" setup>
import type { DefaultTheme } from 'vitepress/theme'
import { inject } from 'vue'
import { navInjectionKey } from '../composables/nav'
import VPLink from './VPLink.vue'

defineProps<{
  item: DefaultTheme.NavItemWithLink
}>()

const { closeScreen } = inject(navInjectionKey)!
</script>

<template>
  <VPLink
    class="vp-nav-screen-menu-group-link"
    :href="item.link"
    :target="item.target"
    :rel="item.rel"
    :no-icon="item.noIcon"
    @click="closeScreen"
  >
    <span v-html="item.text" />
  </VPLink>
</template>

<style scoped>
.vp-nav-screen-menu-group-link {
  display: block;
  margin-left: 12px;
  line-height: 32px;
  font-size: 14px;
  font-weight: 400;
  color: var(--vp-c-text-1);
  transition: color 0.25s;

  &:hover {
    color: var(--vp-c-brand-1);
  }
}
</style>
