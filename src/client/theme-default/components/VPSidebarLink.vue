<script lang="ts" setup>
import type { DefaultTheme } from 'vitepress/theme'
import { inject } from 'vue'
import { useData } from 'vitepress'
import { isActive } from '../support/utils'
import VPLink from './VPLink.vue'

withDefaults(defineProps<{
  item: DefaultTheme.SidebarItem
  depth?: number
}>(), {
  depth: 1
})

const { page, frontmatter } = useData()

const maxDepth: number = frontmatter.value.sidebarDepth || Infinity

const closeSideBar = inject('close-sidebar') as () => void
</script>

<template>
  <VPLink 
    :class="{ active: isActive(page.relativePath, item.link) }"
    :href="item.link"
    @click="closeSideBar"
    >
    <span 
      class="link-text"
      :class="{'link-text-light': depth > 1}">
      {{ item.text }}
    </span>

    <template v-if="depth < maxDepth">
        <VPSidebarLink 
          v-for="child in item.items"
          :key="child.link"
          :item="child"
          :depth="depth + 1"
        />
    </template>
  </VPLink>
</template>

<style scoped>
.link {
  display: block;
  padding: 4px 0;
  color: var(--vp-c-text-2);
  transition: color 0.5s;
}

.link>.link {
  padding: 4px 0 4px 20px;
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

.link-text-light {
  font-size: 13px;
  font-weight: 400;
}
</style>
