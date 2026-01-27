<script setup lang="ts">
import { computed } from 'vue'
import { useData } from '../composables/data'
import { useLangs } from '../composables/langs'
import { useLayout } from '../composables/layout'
import { useSidebarCollapse } from '../composables/sidebar'
import { normalizeLink } from '../support/utils'
import VPImage from './VPImage.vue'

const { site, theme } = useData()
const { hasSidebar, isSidebarEnabled } = useLayout()
const { currentLang } = useLangs()
const { isCollapsed, collapse } = useSidebarCollapse()

const link = computed(() =>
  typeof theme.value.logoLink === 'string'
    ? theme.value.logoLink
    : theme.value.logoLink?.link
)

const rel = computed(() =>
  typeof theme.value.logoLink === 'string'
    ? undefined
    : theme.value.logoLink?.rel
)

const target = computed(() =>
  typeof theme.value.logoLink === 'string'
    ? undefined
    : theme.value.logoLink?.target
)

const showCollapseButton = computed(() => {
  return hasSidebar.value && isSidebarEnabled.value && !isCollapsed.value
})

function handleCollapse() {
  collapse()
}
</script>

<template>
  <div class="VPNavBarTitle" :class="{ 'has-sidebar': hasSidebar, 'sidebar-collapsed': isCollapsed }">
    <template v-if="!isCollapsed || !isSidebarEnabled">
      <a
        class="title"
        :href="link ?? normalizeLink(currentLang.link)"
        :rel
        :target
      >
        <slot name="nav-bar-title-before" />
        <VPImage v-if="theme.logo" class="logo" :image="theme.logo" />
        <span v-if="theme.siteTitle" v-html="theme.siteTitle"></span>
        <span v-else-if="theme.siteTitle === undefined">{{ site.title }}</span>
        <slot name="nav-bar-title-after" />
      </a>
      <button
        v-if="showCollapseButton"
        class="collapse-btn"
        @click="handleCollapse"
        aria-label="collapse sidebar"
        title="collapse sidebar"
      >
        <span class="vpi-sidebar-collapse collapse-icon" />
      </button>
    </template>
  </div>
</template>

<style scoped>
.VPNavBarTitle {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  height: var(--vp-nav-height);
  border-bottom: 1px solid transparent;
}

@media (min-width: 960px) {
  .VPNavBarTitle.has-sidebar {
    border-bottom-color: var(--vp-c-divider);
  }
}

.title {
  display: flex;
  align-items: center;
  height: var(--vp-nav-height);
  font-size: 16px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  transition: opacity 0.25s;
}

@media (min-width: 960px) {
  .title {
    flex-shrink: 0;
  }
}

:deep(.logo) {
  margin-right: 8px;
  height: var(--vp-nav-logo-height);
}

.collapse-btn {
  display: none;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background-color: transparent;
  border: 1px solid var(--vp-c-divider);
  cursor: pointer;
  transition: all 0.25s;
  color: var(--vp-c-text-2);
}

@media (min-width: 960px) {
  .collapse-btn {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.collapse-btn:hover {
  background-color: var(--vp-c-bg-soft);
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.collapse-btn:active {
  transform: scale(0.95);
}

.collapse-icon {
  width: 18px;
  height: 18px;
}
</style>
