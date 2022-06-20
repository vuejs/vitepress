<script lang="ts" setup>
import type { DefaultTheme } from 'vitepress/theme'
import VPFlyout from './VPFlyout.vue'
import { useData } from 'vitepress'
import { isActive } from '../support/utils'

defineProps<{
  item: DefaultTheme.NavItemWithChildren
}>()
const { page } = useData()
</script>

<template>
  <VPFlyout
    :class="{
      VPNavBarMenuGroup: true,
      active: isActive(
        page.relativePath,
        item.activeMatch,
        !!item.activeMatch
      )
    }"
    :button="item.text"
    :items="item.items"
  />
</template>