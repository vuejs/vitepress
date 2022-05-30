<script lang="ts" setup>
import { inject } from 'vue'
import { useData } from 'vitepress'
import { DefaultTheme } from '../config'
import { isActive, normalizeLink } from '../support/utils'
import VPLink from './VPLink.vue'

defineProps<{
  item: DefaultTheme.SidebarItem
}>()

const { page } = useData()

const closeSideBar = inject('close-sidebar') as () => void
</script>

<template>
  <VPLink
    :class="{ active: isActive(page.relativePath, item.link) }"
    :href="normalizeLink(item.link)"
    @click="closeSideBar"
  >
    <span class="link-text">{{ item.text }}</span>
  </VPLink>
</template>

<style scoped>
:deep(.icon) {
  margin-top: -2px;
  width: 14px;
  height: 14px;
  fill: currentColor;
}

.link {
  display: block;
  padding: 6px 0;
  color: var(--vp-c-text-2);
  transition: color 0.5s;
}

.link:hover {
  color: var(--vp-c-text-1);
  transition: color 0.25s;
}

.link.active {
  color: var(--vp-c-brand);
  transition: color 0.25s;
}

.link-text {
  line-height: 20px;
  font-size: 14px;
  font-weight: 500;
}
</style>
