<script lang="ts" setup>
import type { DefaultTheme } from 'vitepress/theme'

import { useNavItemLink } from '../composables/nav'
import VPLink from './VPLink.vue'

const props = defineProps<{
  item: DefaultTheme.NavItemWithLink
}>()

const { href, isActiveLink, isCurrentLink } = useNavItemLink(() => props.item)
</script>

<template>
  <VPLink
    :class="{ VPNavBarMenuLink: true, active: isActiveLink }"
    :aria-current="isCurrentLink ? 'page' : undefined"
    :href
    :target="item.target"
    :rel="item.rel"
    :no-icon="item.noIcon"
    tabindex="0"
  >
    <span v-html="item.text"></span>
  </VPLink>
</template>

<style scoped>
.VPNavBarMenuLink {
  display: flex;
  align-items: center;
  padding: 0 0.75rem;
  line-height: var(--vp-nav-height);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--vp-c-text-1);
  transition: color 0.25s;
}

.VPNavBarMenuLink.active {
  color: var(--vp-c-brand-1);
}

.VPNavBarMenuLink:hover {
  color: var(--vp-c-brand-1);
}
</style>
