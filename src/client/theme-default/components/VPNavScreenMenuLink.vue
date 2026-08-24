<script lang="ts" setup>
import type { DefaultTheme } from 'vitepress/theme'
import { inject } from 'vue'

import { navInjectionKey, useNavItemLink } from '../composables/nav'
import VPLink from './VPLink.vue'

const props = defineProps<{
  item: DefaultTheme.NavItemWithLink
}>()

const { href, isActiveLink, isCurrentLink } = useNavItemLink(() => props.item)

const { closeScreen } = inject(navInjectionKey)!
</script>

<template>
  <VPLink
    :class="{ VPNavScreenMenuLink: true, active: isActiveLink }"
    :aria-current="isCurrentLink ? 'page' : undefined"
    :href
    :target="item.target"
    :rel="item.rel"
    :no-icon="item.noIcon"
    @click="closeScreen"
  >
    <span v-html="item.text"></span>
  </VPLink>
</template>

<style scoped>
.VPNavScreenMenuLink {
  display: block;
  border-bottom: 1px solid var(--vp-c-divider);
  padding: 0.75rem 0 0.6875rem;
  line-height: 1.7142857;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--vp-c-text-1);
  transition: border-color 0.25s, color 0.25s;
}

.VPNavScreenMenuLink:hover {
  color: var(--vp-c-brand-1);
}

.VPNavScreenMenuLink.active {
  color: var(--vp-c-brand-1);
}
</style>
