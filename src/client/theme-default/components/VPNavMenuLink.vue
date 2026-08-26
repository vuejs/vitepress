<script lang="ts" setup>
import type { DefaultTheme } from 'vitepress/theme'
import { inject } from 'vue'

import { navInjectionKey, useNavItemLink } from '../composables/nav'
import VPLink from './VPLink.vue'

const props = defineProps<{
  item: DefaultTheme.NavItemWithLink
  screen?: boolean
}>()

const { href, isActiveLink, isCurrentLink } = useNavItemLink(() => props.item)

const nav = inject(navInjectionKey, null)

function onClick() {
  if (props.screen) nav?.closeScreen()
}
</script>

<template>
  <VPLink
    class="VPNavMenuLink"
    :class="{
      VPNavBarMenuLink: !screen,
      VPNavScreenMenuLink: screen,
      active: isActiveLink
    }"
    :aria-current="isCurrentLink ? 'page' : undefined"
    :href
    :target="item.target"
    :rel="item.rel"
    :no-icon="item.noIcon"
    @click="onClick"
  >
    <span v-html="item.text"></span>
  </VPLink>
</template>

<style scoped>
.VPNavMenuLink {
  color: var(--vp-c-text-1);
  font-size: 0.875rem;
  font-weight: 500;
  transition: color 0.25s;
}

.VPNavMenuLink:hover,
.VPNavMenuLink.active {
  color: var(--vp-c-brand-1);
}

.VPNavBarMenuLink {
  display: flex;
  align-items: center;
  min-height: var(--vp-nav-height);
  padding: 0 0.75rem;
  line-height: 1.5;
}

.VPNavScreenMenuLink {
  display: block;
  border-bottom: 1px solid var(--vp-c-divider);
  padding: 0.75rem 0 0.6875rem;
  line-height: 1.7142857;
  transition: border-color 0.25s, color 0.25s;
}
</style>
