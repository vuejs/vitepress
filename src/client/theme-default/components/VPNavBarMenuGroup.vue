<script lang="ts" setup>
import type { DefaultTheme } from 'vitepress/theme'
import { computed } from 'vue'
import { useData } from '../composables/data'
import { isActive } from '../../shared'
import VPFlyout from './VPFlyout.vue'

const props = defineProps<{
  item: DefaultTheme.NavItemWithChildren
}>()

const { page } = useData()

const isChildActive = (navItem: DefaultTheme.NavItem) => {
  if ('link' in navItem) {
    return isActive(
      page.value.relativePath,
      navItem.link,
      !!props.item.activeMatch
    )
  } else {
    return navItem.items.some(isChildActive)
  }
}

const childrenActive = computed(() => isChildActive(props.item))

const menuActive = computed(() => {
  const { activeMatch } = props.item
  if (activeMatch)
    return isActive(page.value.relativePath, activeMatch, true)
  else
    return childrenActive.value
})
</script>

<template>
  <VPFlyout
    :class="{
      VPNavBarMenuGroup: true,
      active: menuActive
    }"
    :button="item.text"
    :items="item.items"
  />
</template>
