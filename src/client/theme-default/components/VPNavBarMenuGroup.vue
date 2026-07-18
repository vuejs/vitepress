<script lang="ts" setup>
import { useRoute } from 'vitepress'
import type { DefaultTheme } from 'vitepress/theme'
import { computed } from 'vue'
import { isActive } from '../../shared'
import VPFlyout from './VPFlyout.vue'

const props = defineProps<{
  item: DefaultTheme.NavItemWithChildren
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
</script>

<template>
  <VPFlyout
    :class="{ VPNavBarMenuGroup: true, active: isActiveGroup }"
    :button="item.text"
    :items="item.items"
  />
</template>
