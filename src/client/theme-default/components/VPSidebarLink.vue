<script lang="ts" setup>
import type { DefaultTheme } from 'vitepress/theme'
import { computed, inject } from 'vue'
import { useData } from 'vitepress'
import { isActive } from '../support/utils'
import VPLink from './VPLink.vue'

withDefaults(defineProps<{ item: DefaultTheme.SidebarItem; depth?: number }>(), { depth: 1 })

const { page, frontmatter } = useData()
const maxDepth = computed<number>(() => frontmatter.value.sidebarDepth || Infinity)
const closeSideBar = inject('close-sidebar') as () => void
</script>

<template>
  <VPLink
    class="link"
    :class="{ active: isActive(page.relativePath, item.link), offset: depth > 1 }"
    :href="item.link"
    @click="closeSideBar"
  >
    <span class="link-text" :class="{ light: depth > 1 }">{{ item.text }}</span>
    <template
      v-if="'items' in item && depth < maxDepth"
      v-for="child in item.items"
      :key="child.link"
    >
      <VPSidebarLink :item="child" :depth="depth + 1" />
    </template>
  </VPLink>
</template>

<style scoped>
.link {
  display: block;
  margin: 4px 0;
  color: var(--vp-c-text-2);
  transition: color 0.5s;
}

.link.offset {
  padding-left: 16px;
}

.link:hover {
  color: var(--vp-c-text-1);
}

.link.active {
  color: var(--vp-c-brand);
}

.link :deep(.icon) {
  width: 12px;
  height: 12px;
  fill: currentColor;
}

.link-text {
  line-height: 20px;
  font-size: 14px;
  font-weight: 500;
}

.link-text.light {
  font-size: 13px;
  font-weight: 400;
}
</style>
