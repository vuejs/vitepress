<script lang="ts" setup>
import { useEventListener, useScrollLock } from '@vueuse/core'
import { inBrowser } from 'vitepress'
import { ref, watch } from 'vue'
import { useLayout } from '../composables/layout'
import VPSidebarGroup from './VPSidebarGroup.vue'
import { useSidebarControl } from '../composables/sidebar'

const { isHome,sidebarGroups } = useLayout()
const { isCollapsed } = useSidebarControl()

const props = defineProps<{
  open: boolean
}>()

// a11y: focus Nav element when menu has opened
const navEl = ref<HTMLElement | null>(null)
const isLocked = useScrollLock(inBrowser ? document.body : null)

watch(
  [props, navEl],
  () => {
    if (props.open) {
      isLocked.value = true
      navEl.value?.focus()
    } else isLocked.value = false
  },
  { immediate: true, flush: 'post' }
)

const key = ref(0)


watch(
  sidebarGroups,
  () => {
    key.value += 1
  },
  { deep: true }
)

useEventListener(document,'mousemove',(e)=>{
  if(isHome.value) return
  if(e.clientX<5){
    navEl.value?.classList.add('expanded')
  }else if(e.target instanceof Node &&!navEl.value?.contains(e.target)&&e.pageX>272){
    navEl.value?.classList.remove('expanded')
  }
})

</script>

<template>
    <aside
    class="VPSidebar"
    :class="{ open ,collapsed:isCollapsed}"
    ref="navEl"
    @click.stop
    v-if="!isHome"
  >
    <div class="curtain" />

    <nav
      class="nav"
      id="VPSidebarNav"
      aria-labelledby="sidebar-aria-label"
      tabindex="-1"
    >
      <span class="visually-hidden" id="sidebar-aria-label">
        Sidebar Navigation
      </span>

      <slot name="sidebar-nav-before" />
      <VPSidebarGroup :items="sidebarGroups" :key />
      <slot name="sidebar-nav-after" />
    </nav>
  </aside>
</template>

<style scoped>
.VPSidebar {
  position: fixed;
  top: var(--vp-layout-top-height, 0px);
  bottom: 0;
  left: 0;
  z-index: var(--vp-z-index-sidebar);
  padding: 32px 32px 96px;
  width: calc(100vw - 64px);
  max-width: 320px;
  background-color: var(--vp-sidebar-bg-color);
  opacity: 0;
  box-shadow: var(--vp-c-shadow-3);
  overflow-x: hidden;
  overflow-y: auto;
  transform: translateX(-100%);
  transition: opacity 0.5s, transform 0.25s ease;
  overscroll-behavior: contain;
}

.collapsed{
  transform: translateX(-100%);
  opacity: 0 !important;
  transition: opacity 0.25s, transform 0.25s ease;
  overscroll-behavior: contain;
}
.expanded{
  transform: translateX(0);
  opacity: 1 !important;
  transition: opacity 0.25s, transform 0.25s ease;
  overscroll-behavior: contain;
  width: calc(100vw - 64px);
  max-width: 320px;
  z-index: var(--vp-z-index-sidebar) !important;
}

.VPSidebar.open {
  opacity: 1;
  visibility: visible;
  transform: translateX(0);
}

.dark .VPSidebar {
  box-shadow: var(--vp-shadow-1);
}

@media (min-width: 960px) {
  .VPSidebar {
    padding-top: var(--vp-nav-height);
    width: var(--vp-sidebar-width);
    max-width: 100%;
    background-color: var(--vp-sidebar-bg-color);
    opacity: 1;
    visibility: visible;
    box-shadow: none;
    transform: translateX(0);
  }
}

@media (min-width: 1440px) {
  .VPSidebar {
    padding-left: max(32px, calc((100% - (var(--vp-layout-max-width) - 64px)) / 2));
    width: calc((100% - (var(--vp-layout-max-width) - 64px)) / 2 + var(--vp-sidebar-width) - 32px);
  }
}

@media (min-width: 960px) {
  .curtain {
    position: sticky;
    top: -64px;
    left: 0;
    z-index: 1;
    margin-top: calc(var(--vp-nav-height) * -1);
    margin-right: -32px;
    margin-left: -32px;
    height: var(--vp-nav-height);
    background-color: var(--vp-sidebar-bg-color);
  }
}

.nav {
  outline: 0;
}
</style>
