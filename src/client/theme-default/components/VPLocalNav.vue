<script lang="ts" setup>
import { useWindowScroll } from '@vueuse/core'
import { computed, onMounted, ref } from 'vue'
import { useData } from '../composables/data'
import { useLayout } from '../composables/layout'
import VPLocalNavOutlineDropdown from './VPLocalNavOutlineDropdown.vue'

defineProps<{
  open: boolean
}>()

defineEmits<{
  (e: 'open-menu'): void
}>()

const { theme } = useData()
const { isHome, hasSidebar, headers, hasLocalNav } = useLayout()
const { y } = useWindowScroll()

const navHeight = ref(0)

onMounted(() => {
  navHeight.value = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue(
      '--vp-nav-height'
    )
  )
})

const classes = computed(() => {
  return {
    VPLocalNav: true,
    'has-sidebar': hasSidebar.value,
    empty: !hasLocalNav.value,
    fixed: !hasLocalNav.value && !hasSidebar.value
  }
})
</script>

<template>
  <div
    v-if="!isHome && (hasLocalNav || hasSidebar || y >= navHeight)"
    :class="classes"
  >
    <div class="container">
      <button
        v-if="hasSidebar"
        class="menu"
        :aria-expanded="open"
        aria-controls="VPSidebarNav"
        @click="$emit('open-menu')"
      >
        <span class="vpi-align-left menu-icon"></span>
        <span class="menu-text">
          {{ theme.sidebarMenuLabel || 'Menu' }}
        </span>
      </button>

      <VPLocalNavOutlineDropdown :headers :navHeight />
    </div>
  </div>
</template>

<style scoped>
.VPLocalNav {
  position: sticky;
  top: 0;
  /*rtl:ignore*/
  left: 0;
  z-index: var(--vp-z-index-local-nav);
  border-bottom: 1px solid var(--vp-c-gutter);
  padding-top: var(--vp-layout-top-height, 0px);
  width: 100%;
  background-color: var(--vp-local-nav-bg-color);
}

.VPLocalNav.fixed {
  position: fixed;
}

@media (min-width: 60rem) {
  .VPLocalNav {
    top: var(--vp-nav-height);
  }

  .VPLocalNav.has-sidebar {
    padding-left: var(--vp-sidebar-width);
  }

  .VPLocalNav.empty {
    display: none;
  }
}

@media (min-width: 80rem) {
  .VPLocalNav {
    display: none;
  }
}

.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.menu {
  display: flex;
  align-items: center;
  line-height: 1.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--vp-c-text-2);
  transition: color 0.5s;
}

.menu:hover {
  color: var(--vp-c-text-1);
  transition: color 0.25s;
}

@media (min-width: 60rem) {
  .menu {
    display: none;
  }
}

.menu-icon {
  margin-right: 0.5rem;
  font-size: 0.875rem;
}

.menu,
:deep(.VPLocalNavOutlineDropdown > button) {
  padding: 0.75rem 1.5rem 0.6875rem;
}

@media (min-width: 48rem) {
  .menu,
  :deep(.VPLocalNavOutlineDropdown > button) {
    padding: 0.75rem 2rem 0.6875rem;
  }
}
</style>
