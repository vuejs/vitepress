<script lang="ts" setup>
import { useIcon } from 'vitepress'
import { useTemplateRef } from 'vue'

const props = defineProps<{
  /**
   * `name` (a simple-icons name) or `collection:name` for any
   * `@iconify-json/*` collection installed in the project, or a raw
   * `{ svg }` string.
   */
  icon: string | { svg: string }
}>()

const el = useTemplateRef('el')
const iconClass = useIcon(() => props.icon, el)
</script>

<template>
  <span v-if="typeof icon === 'object'" class="VPIcon" v-html="icon.svg"></span>
  <span v-else ref="el" :class="iconClass"></span>
</template>

<style scoped>
.VPIcon {
  display: inline-block;
  width: 1em;
  height: 1em;
}

.VPIcon :deep(svg) {
  width: 100%;
  height: 100%;
  fill: currentColor;
}
</style>
