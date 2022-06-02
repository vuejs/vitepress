<script lang="ts" setup>
import { useData } from 'vitepress'
import { isActive } from '../support/utils'
import VPLink from './VPLink.vue'

defineProps<{
  item: any
}>()

const { page } = useData()
</script>

<template>
  <div class="VPMenuLink">
    <VPLink 
      :class="{ active: isActive(page.relativePath, item.activeMatch || item.link) }"
      :href="item.link"
    >
      {{ item.text }}
    </VPLink>
  </div>
</template>

<style scoped>
.VPMenuGroup + .VPMenuLink {
  margin: .75rem -0.75rem 0;
  border-top: .0625rem solid var(--vp-c-divider-light);
  padding: .75rem .75rem 0;
}

.link {
  display: block;
  border-radius: 6px;
  padding: 0 .75rem;
  line-height: 2rem;
  font-size: .875rem;
  font-weight: 500;
  color: var(--vp-c-text-1);
  white-space: nowrap;
  transition: background-color 0.25s, color 0.25s;
}

.link:hover {
  color: var(--vp-c-brand);
  background-color: var(--vp-c-bg-mute);
}

.dark .link:hover {
  background-color: var(--vp-c-bg-soft);
}

.link.active {
  color: var(--vp-c-brand);
}
</style>
