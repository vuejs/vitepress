<script lang="ts" setup>
import type { DefaultTheme } from 'vitepress/theme'
import { type Ref, computed, inject, ref, watchEffect } from 'vue'
import { useData } from '../composables/data.js'
import { useSidebar } from '../composables/sidebar.js'
import { isActive } from '../support/utils.js'
import VPLink from './VPLink.vue'

const props = defineProps<{
  item: DefaultTheme.SidebarLink
}>()

const { page } = useData()

const active = computed(() =>
  isActive(page.value.relativePath, props.item.link)
)

const { isSidebarEnabled } = useSidebar()
const closeSideBar = inject('close-sidebar') as () => void
const isSidebarOpen = inject('is-sidebar-open') as Ref<boolean>

const link = ref<InstanceType<typeof VPLink> | null>(null)
watchEffect(() => {
  if (isSidebarOpen.value && active.value) {
    link.value?.$el?.focus()
  }
})
</script>

<template>
  <VPLink
    class="VPSidebarLink"
    :class="{ active }"
    :href="item.link"
    :tabindex="isSidebarEnabled || isSidebarOpen ? 0 : -1"
    ref="link"
    @click="closeSideBar"
  >
    <span class="link-text" v-html="item.text" />
  </VPLink>
</template>

<style scoped>
.VPSidebarLink {
  display: block;
  padding: 4px 0;
  color: var(--vp-c-text-2);
  transition: color 0.5s;
}

.VPSidebarLink:hover {
  color: var(--vp-c-text-1);
}

.VPSidebarLink.active {
  color: var(--vp-c-brand);
}

.VPSidebarLink :deep(.icon) {
  width: 12px;
  height: 12px;
  fill: currentColor;
}

.link-text {
  display: inline-block;
  line-height: 24px;
  font-size: 14px;
  font-weight: 500;
}
</style>
