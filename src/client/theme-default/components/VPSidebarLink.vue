<script lang="ts" setup>
import { inject } from 'vue'
import { useData } from 'vitepress'
import { DefaultTheme } from '../config'
import { isActive, normalizeLink } from '../support/utils'

defineProps<{
  item: DefaultTheme.SidebarItem
}>()

const { page } = useData()

const closeSideBar = inject('close-sidebar') as () => void
</script>

<template>
  <a
    class="link"
    :class="{ active: isActive(page.relativePath, item.link) }"
    :href="normalizeLink(item.link)"
    @click="closeSideBar"
  >
    <p class="link-text">{{ item.text }}</p>
  </a>
</template>

<style scoped>
.link {
  display: block;
  padding: 6px 0;
}

.link:hover .link-text {
  color: var(--vp-c-text-1);
  transition: color 0.25s;
}

.link.active .link-text {
  color: var(--vp-c-brand);
  transition: color 0.25s;
}

.link-text {
  line-height: 20px;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-2);
  transition: color 0.5s;
}
</style>
