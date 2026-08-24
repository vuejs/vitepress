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
    :class="{ VPNavScreenMenuGroupLink: true, active: isActiveLink }"
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
.VPNavScreenMenuGroupLink {
  display: block;
  margin-left: 0.75rem;
  line-height: 2.2857143;
  font-size: 0.875rem;
  font-weight: 400;
  color: var(--vp-c-text-1);
  transition: color 0.25s;
}

.VPNavScreenMenuGroupLink:hover {
  color: var(--vp-c-brand-1);
}

.VPNavScreenMenuGroupLink.active {
  color: var(--vp-c-brand-1);
}
</style>
