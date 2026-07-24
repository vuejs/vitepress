<script lang="ts" setup>
import { useScrollLock } from '@vueuse/core'
import { inBrowser, useRoute } from 'vitepress'
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useLayout } from '../composables/layout'
import VPSidebarGroup from './VPSidebarGroup.vue'

const { sidebarGroups, hasSidebar } = useLayout()
const route = useRoute()

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

const userScrolled = ref(false)
const isProgrammaticScrolling = ref(false)

const scrollToActiveItem = async (smooth: boolean = true) => {
  // if SSR || (Mobile && Not open)
  if (!inBrowser || (window.innerWidth < 960 && !props.open)) return

  await nextTick()
  const container = navEl.value
  const activeItem = container?.querySelector('.VPSidebarItem.is-active')
  if (!container || !activeItem) return

  // set flags
  isProgrammaticScrolling.value = true
  userScrolled.value = false

  activeItem.scrollIntoView({
    behavior: smooth ? 'smooth' : 'instant',
    block: 'center',
    inline: 'nearest'
  })

  // reset flag when scroll ends
  container.addEventListener('scrollend', () => {
    isProgrammaticScrolling.value = false
  }, { once: true })
}

const onSidebarScroll = () => {
  // ignore programmatic scrolls
  if (!isProgrammaticScrolling.value) userScrolled.value = true
}

const onWindowResize = () => {
  // scroll only if the user has not scrolled manually
  if (!userScrolled.value) scrollToActiveItem(false)
}

// route changes
watch(() => route.path, () => scrollToActiveItem(true))

// sidebar content changes
watch(sidebarGroups, () => scrollToActiveItem(false), { deep: true })

// Mobile: when opened
watch(() => props.open, (newOpen) => {
  if (newOpen) scrollToActiveItem(false)
})

// scroll once; attach event listeners
onMounted(() => {
  scrollToActiveItem(false)
  if (inBrowser && navEl.value) {
    navEl.value.addEventListener('scroll', onSidebarScroll)
    window.addEventListener('resize', onWindowResize)
  }
})

// clean up event listeners
onBeforeUnmount(() => {
  if (inBrowser && navEl.value) {
    navEl.value.removeEventListener('scroll', onSidebarScroll)
    window.removeEventListener('resize', onWindowResize)
  }
})
</script>

<template>
  <aside
    v-if="hasSidebar"
    class="VPSidebar"
    :class="{ open }"
    ref="navEl"
    @click.stop
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

.VPSidebar.open {
  opacity: 1;
  visibility: visible;
  transform: translateX(0);
  transition: opacity 0.25s,
    transform 0.5s cubic-bezier(0.19, 1, 0.22, 1);
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
    top: calc(var(--vp-nav-height) * -1);
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
