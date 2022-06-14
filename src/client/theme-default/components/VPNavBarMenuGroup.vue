<script lang="ts" setup>
import type { DefaultTheme } from '..'
import VPFlyout from './VPFlyout.vue'

defineProps<{
  item: DefaultTheme.NavItemWithChildren
}>()
</script>

<template>
  <VPFlyout :button="item.text" :items="item.items" />
</template>
