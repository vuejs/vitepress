<script setup lang="ts">
import { useRoute } from 'vitepress'
import VPNavMenuGroup from 'vitepress/dist/client/theme-default/components/VPNavMenuGroup.vue'
import { computed } from 'vue'

const props = defineProps<{
  versions: { text: string; link: string }[]
  screenMenu?: boolean
  menu?: boolean
}>()

const route = useRoute()

const sortedVersions = computed(() => {
  return [...props.versions].sort(
    (a, b) => b.link.split('/').length - a.link.split('/').length
  )
})

const currentVersion = computed(() => {
  return (
    sortedVersions.value.find((version) => route.path.startsWith(version.link))
      ?.text || 'Versions'
  )
})
</script>

<template>
  <VPNavMenuGroup
    :item="{ text: currentVersion, items: versions }"
    :screen="screenMenu"
    :menu="menu"
    class="VPNavVersion"
  />
</template>

<style scoped>
.VPNavVersion :deep(button .text) {
  color: var(--vp-c-text-1) !important;
}

.VPNavVersion:hover :deep(button .text) {
  color: var(--vp-c-text-2) !important;
}
</style>
