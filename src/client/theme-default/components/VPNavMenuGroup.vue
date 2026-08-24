<script lang="ts" setup>
import { useRoute } from 'vitepress'
import type { DefaultTheme } from 'vitepress/theme'
import { computed, ref, useId } from 'vue'

import { isActive } from '../../shared'
import VPFlyout from './VPFlyout.vue'
import VPMenuGroup from './VPMenuGroup.vue'
import VPMenuLink from './VPMenuLink.vue'

const props = defineProps<{
  item: DefaultTheme.NavItemWithChildren
  screen?: boolean
}>()

const route = useRoute()

const isActiveGroup = computed(() => {
  if (props.item.activeMatch) {
    return isActive(
      route.data.relativePath,
      route.hash,
      props.item.activeMatch,
      true
    )
  }
  return isChildActive(props.item)
})

function isChildActive(navItem: DefaultTheme.NavItem): boolean {
  if ('component' in navItem) return false

  if ('link' in navItem) {
    const href =
      typeof navItem.link === 'function'
        ? navItem.link(route.data)
        : navItem.link

    return isActive(
      route.data.relativePath,
      route.hash,
      navItem.activeMatch || href,
      !!navItem.activeMatch
    )
  }

  return navItem.items.some(isChildActive)
}

// screen accordion state — resets when the screen unmounts
const isOpen = ref(false)
const groupId = useId()

function toggle() {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <VPFlyout
    v-if="!screen"
    :class="{ VPNavMenuGroup: true, VPNavBarMenuGroup: true, active: isActiveGroup }"
    :button="item.text"
    :items="item.items"
  />

  <div
    v-else
    class="VPNavMenuGroup VPNavScreenMenuGroup"
    :class="{ open: isOpen, active: isActiveGroup }"
  >
    <button
      type="button"
      class="button"
      :aria-expanded="isOpen"
      :aria-controls="groupId"
      @click="toggle"
    >
      <span class="button-text" v-html="item.text"></span>
      <span class="vpi-plus button-icon" aria-hidden="true" />
    </button>

    <ul v-show="isOpen" :id="groupId" class="items">
      <template v-for="child in item.items" :key="JSON.stringify(child)">
        <VPMenuLink v-if="'link' in child" :item="child" />
        <li v-else-if="'component' in child">
          <component :is="child.component" v-bind="child.props" screen-menu />
        </li>
        <VPMenuGroup v-else :text="child.text" :items="child.items" />
      </template>
    </ul>
  </div>
</template>

<style scoped>
.VPNavScreenMenuGroup {
  border-bottom: 1px solid var(--vp-c-divider);
  transition: border-color 0.5s;
}

.VPNavScreenMenuGroup.open {
  padding-bottom: 0.625rem;
}

.VPNavScreenMenuGroup.open .button {
  padding-bottom: 0.375rem;
  color: var(--vp-c-brand-1);
}

.VPNavScreenMenuGroup.open .button-icon {
  /*rtl:ignore*/
  transform: rotate(45deg);
}

.button {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0.25rem 0.6875rem 0;
  width: 100%;
  line-height: 1.7142857;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--vp-c-text-1);
  transition: color 0.25s;
}

.button:hover,
.VPNavScreenMenuGroup.active .button {
  color: var(--vp-c-brand-1);
}

.button-icon {
  transition: transform 0.25s;
}

.items :deep(.VPMenuGroup) {
  padding-top: 0.25rem;
}
</style>
