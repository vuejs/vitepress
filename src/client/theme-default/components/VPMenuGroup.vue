<script
  lang="ts"
  setup
  generic="
    T extends
      | DefaultTheme.NavItemComponent
      | DefaultTheme.NavItemChildren
      | DefaultTheme.NavItemWithLink
  "
>
import type { DefaultTheme } from 'vitepress/theme'
import { inject } from 'vue'

import { navScreenInjectionKey } from '../composables/nav'
import VPMenuLink from './VPMenuLink.vue'

defineProps<{
  text?: string
  items: T[]
}>()

const screen = inject(navScreenInjectionKey, false)
</script>

<template>
  <li
    class="VPMenuGroup"
    :class="{ VPNavScreenMenuGroupSection: screen }"
  >
    <p v-if="text" class="title">{{ text }}</p>

    <ul>
      <template v-for="item in items" :key="JSON.stringify(item)">
        <VPMenuLink v-if="'link' in item" :item />
        <component
          v-else-if="'component' in item"
          :is="item.component"
          v-bind="item.props"
          :screen-menu="screen || undefined"
        />
        <VPMenuGroup v-else :text="item.text" :items="item.items" />
      </template>
    </ul>
  </li>
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
  line-height: 2.2857143;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
  white-space: nowrap;
  transition: color 0.25s;
}

/* inside the nav screen the group renders as a flat titled section */
.VPNavScreen .VPMenuGroup {
  margin: 0;
  border: none;
  padding: 0;
}

.VPNavScreen .title {
  padding: 0;
  line-height: 2.4615385;
  font-size: 0.8125rem;
  font-weight: 700;
  white-space: normal;
}
</style>
