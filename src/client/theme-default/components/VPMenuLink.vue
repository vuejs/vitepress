<script lang="ts" setup generic="T extends DefaultTheme.NavItemWithLink">
import type { DefaultTheme } from 'vitepress/theme'
import { inject } from 'vue'

import {
  navInjectionKey,
  navScreenInjectionKey,
  useNavItemLink
} from '../composables/nav'
import VPLink from './VPLink.vue'

const props = defineProps<{
  item: T
  rel?: string
}>()

const { href, isActiveLink, isCurrentLink } = useNavItemLink(() => props.item)

const screen = inject(navScreenInjectionKey, false)
const nav = inject(navInjectionKey, null)

function onClick() {
  if (screen) nav?.closeScreen()
}

defineOptions({ inheritAttrs: false })
</script>

<template>
  <li class="VPMenuLink">
    <VPLink
      v-bind="$attrs"
      :class="{
        active: isActiveLink,
        VPNavScreenMenuGroupLink: screen
      }"
      :aria-current="isCurrentLink ? 'page' : undefined"
      :href
      :target="item.target"
      :rel="props.rel ?? item.rel"
      :no-icon="item.noIcon"
      @click="onClick"
    >
      <span v-html="item.text"></span>
    </VPLink>
  </li>
</template>

<style scoped>
.VPMenuGroup + .VPMenuLink {
  margin: 0.75rem -0.75rem 0;
  border-top: 1px solid var(--vp-c-divider);
  padding: 0.75rem 0.75rem 0;
}

.link {
  display: block;
  border-radius: 0.375rem;
  padding: 0 0.75rem;
  line-height: 2.2857143;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--vp-c-text-1);
  text-align: left;
  white-space: nowrap;
  transition: background-color 0.25s, color 0.25s;
}

.link:hover {
  color: var(--vp-c-brand-1);
  background-color: var(--vp-c-default-soft);
}

.link.active {
  color: var(--vp-c-brand-1);
}

/* inside the nav screen the menu links render as a plain indented list */
.VPNavScreen .VPMenuLink {
  margin: 0;
  border: none;
  padding: 0;
}

.VPNavScreen .link {
  display: block;
  margin-left: 0.75rem;
  border-radius: 0;
  padding: 0;
  font-weight: 400;
  white-space: normal;
}

.VPNavScreen .link:hover {
  background-color: transparent;
}
</style>
