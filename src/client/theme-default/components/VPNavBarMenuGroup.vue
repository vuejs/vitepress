<script lang="ts" setup>
import { DefaultTheme, useData } from 'vitepress'
import { isActive } from '../support/utils'
import VPFlyout from './VPFlyout.vue'

defineProps<{
  item: DefaultTheme.NavItemWithChildren
}>()

const { page } = useData()
</script>

<template>
  <VPFlyout
    :button="item.text"
    :items="item.items"
  />
</template>
