<script lang="ts" setup>
import { useData } from '../composables/data'
import { useSidebar } from '../composables/sidebar'
import VPIconAlignLeft from './icons/VPIconAlignLeft.vue'
import VPLocalNavOutlineDropdown from './VPLocalNavOutlineDropdown.vue'

defineProps<{
  open: boolean
}>()

defineEmits<{
  (e: 'open-menu'): void
}>()

const { theme, frontmatter } = useData()
const { hasSidebar } = useSidebar()
</script>

<template>
  <div class="VPLocalNav" v-if="frontmatter.layout !== 'home'">
    <button
      v-if="hasSidebar"
      class="menu"
      :aria-expanded="open"
      aria-controls="VPSidebarNav"
      @click="$emit('open-menu')"
    >
      <VPIconAlignLeft class="menu-icon" />
      <span class="menu-text">
        {{ theme.sidebarMenuLabel || 'Menu' }}
      </span>
    </button>

    <VPLocalNavOutlineDropdown />
  </div>
</template>

<style scoped>
.VPLocalNav {
  position: sticky;
  top: 0;
  /*rtl:ignore*/
  left: 0;
  z-index: var(--vp-z-index-local-nav);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--vp-c-gutter);
  padding-top: var(--vp-layout-top-height, 0px);
  width: 100%;
  background-color: var(--vp-local-nav-bg-color);
  transition: border-color 0.5s, background-color 0.5s;
}

@media (min-width: 960px) {
  .VPLocalNav {
    display: none;
  }
}

.menu {
  display: flex;
  align-items: center;
  padding: 12px 24px 11px;
  line-height: 24px;
  font-size: 12px;
  font-weight: 500;
  color: var(--vp-c-text-2);
  transition: color 0.5s;
}

.menu:hover {
  color: var(--vp-c-text-1);
  transition: color 0.25s;
}

@media (min-width: 768px) {
  .menu {
    padding: 0 32px;
  }
}

.menu-icon {
  margin-right: 8px;
  width: 16px;
  height: 16px;
  fill: currentColor;
}

.VPOutlineDropdown {
  padding: 12px 24px 11px;
}

@media (min-width: 768px) {
  .VPOutlineDropdown {
    padding: 12px 32px 11px;
  }
}
</style>
