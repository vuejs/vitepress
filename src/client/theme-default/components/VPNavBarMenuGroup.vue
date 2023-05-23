<script lang="ts" setup>
import type { DefaultTheme } from 'vitepress/theme'
import { useData } from '../composables/data'
import { isActive } from '../../shared'
import VPFlyout from './VPFlyout.vue'

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
