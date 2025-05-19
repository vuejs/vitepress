<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vitepress'
import VPNavBarMenuGroup from 'vitepress/dist/client/theme-default/components/VPNavBarMenuGroup.vue'
import VPNavScreenMenuGroup from 'vitepress/dist/client/theme-default/components/VPNavScreenMenuGroup.vue'

const props = defineProps<{
  versions: { text: string; link: string }[]
  screenMenu?: boolean
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
  <VPNavBarMenuGroup
    v-if="!screenMenu"
    :item="{ text: currentVersion, items: versions }"
    class="VPNavVersion"
  />
  <VPNavScreenMenuGroup
    v-else
    :text="currentVersion"
    :items="versions"
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
