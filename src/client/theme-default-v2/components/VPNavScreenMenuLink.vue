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
    class="vp-nav-screen-menu-link"
    :href="item.link"
    :target="item.target"
    :rel="item.rel"
    :no-icon="item.noIcon"
    @click="closeScreen"
  >
    <span v-html="item.text" />
  </VPLink>
</template>

<style>
.vp-nav-screen-menu-link {
  display: block;
  border-bottom: 1px solid var(--vp-c-divider);
  padding: 12px 0 11px;
  line-height: 24px;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-1);
  transition:
    color 0.25s,
    border-color 0.25s;

  &:hover {
    color: var(--vp-c-brand-1);
  }
}
</style>
