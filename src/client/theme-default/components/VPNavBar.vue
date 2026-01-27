<script lang="ts" setup>
import { useWindowScroll } from '@vueuse/core'
import { ref, watchPostEffect } from 'vue'
import { useLayout } from '../composables/layout'
import { useSidebarCollapse } from '../composables/sidebar'
import VPNavBarAppearance from './VPNavBarAppearance.vue'
import VPNavBarExtra from './VPNavBarExtra.vue'
import VPNavBarHamburger from './VPNavBarHamburger.vue'
import VPNavBarMenu from './VPNavBarMenu.vue'
import VPNavBarSearch from './VPNavBarSearch.vue'
import VPNavBarSocialLinks from './VPNavBarSocialLinks.vue'
import VPNavBarTitle from './VPNavBarTitle.vue'
import VPNavBarTranslations from './VPNavBarTranslations.vue'

const props = defineProps<{
  isScreenOpen: boolean
}>()

defineEmits<{
  (e: 'toggle-screen'): void
}>()

const { y } = useWindowScroll()
const { isHome, hasSidebar } = useLayout()
const { isCollapsed, expand } = useSidebarCollapse()

const searchRef = ref<InstanceType<typeof VPNavBarSearch> | null>(null)

const classes = ref<Record<string, boolean>>({})

watchPostEffect(() => {
  classes.value = {
    'has-sidebar': hasSidebar.value,
    'sidebar-collapsed': isCollapsed.value,
    'home': isHome.value,
    'top': y.value === 0,
    'screen-open': props.isScreenOpen
  }
})

function handleExpand() {
  expand()
}

function handleCapsuleSearch() {
  searchRef.value?.openSearch()
}
</script>

<template>
  <div class="VPNavBar" :class="classes">
    <div class="wrapper">
      <div class="container">
        <div class="title">
          <VPNavBarTitle>
            <template #nav-bar-title-before><slot name="nav-bar-title-before" /></template>
            <template #nav-bar-title-after><slot name="nav-bar-title-after" /></template>
          </VPNavBarTitle>
          <div v-if="hasSidebar && isCollapsed" class="expand-capsule">
            <button
              class="capsule-btn expand-btn"
              @click="handleExpand"
              aria-label="Expand sidebar"
              title="Expand sidebar"
            >
              <span class="vpi-sidebar-expand capsule-icon" />
            </button>
            <div class="capsule-divider" />
            <button
              class="capsule-btn search-btn"
              @click="handleCapsuleSearch"
              aria-label="Search"
              title="Search"
            >
              <span class="vpi-search capsule-icon" />
            </button>
          </div>
        </div>

        <div class="content">
          <div class="content-body">
            <slot name="nav-bar-content-before" />
            <VPNavBarSearch ref="searchRef" :icon-only="hasSidebar && isCollapsed" class="search" />
            <VPNavBarMenu class="menu" />
            <VPNavBarTranslations class="translations" />
            <VPNavBarAppearance class="appearance" />
            <VPNavBarSocialLinks class="social-links" />
            <VPNavBarExtra class="extra" />
            <slot name="nav-bar-content-after" />
            <VPNavBarHamburger class="hamburger" :active="isScreenOpen" @click="$emit('toggle-screen')" />
          </div>
        </div>
      </div>
    </div>

    <div class="divider">
      <div class="divider-line" />
    </div>
  </div>
</template>

<style scoped>
.VPNavBar {
  position: relative;
  height: var(--vp-nav-height);
  pointer-events: none;
  white-space: nowrap;
  transition: background-color 0.25s;
}

.VPNavBar.screen-open {
  transition: none;
  background-color: var(--vp-nav-bg-color);
  border-bottom: 1px solid var(--vp-c-divider);
}

.VPNavBar:not(.home) {
  background-color: var(--vp-nav-bg-color);
}

@media (min-width: 960px) {
  .VPNavBar:not(.home) {
    background-color: transparent;
  }

  .VPNavBar:not(.has-sidebar):not(.home.top) {
    background-color: var(--vp-nav-bg-color);
  }
}

.wrapper {
  padding: 0 8px 0 24px;
}

@media (min-width: 768px) {
  .wrapper {
    padding: 0 32px;
  }
}

@media (min-width: 960px) {
  .VPNavBar.has-sidebar .wrapper {
    padding: 0;
  }
}

.container {
  display: flex;
  justify-content: space-between;
  margin: 0 auto;
  max-width: calc(var(--vp-layout-max-width) - 64px);
  height: var(--vp-nav-height);
  pointer-events: none;
}

.container > .title,
.container > .content {
  pointer-events: none;
}

.container :deep(*) {
  pointer-events: auto;
}

@media (min-width: 960px) {
  .VPNavBar.has-sidebar .container {
    max-width: 100%;
  }
}

.title {
  flex-shrink: 0;
  height: calc(var(--vp-nav-height) - 1px);
  transition: background-color 0.5s;
  display: flex;
  align-items: center;
}

@media (min-width: 960px) {
  .VPNavBar.has-sidebar .title {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2;
    padding: 0 32px;
    width: var(--vp-sidebar-width);
    height: var(--vp-nav-height);
    background-color: transparent;
    transition: width 0.3s ease, padding 0.3s ease;
  }

  .VPNavBar.has-sidebar.sidebar-collapsed .title {
    padding-left: 24px;
    width: auto;
  }

  .VPNavBar.has-sidebar.sidebar-collapsed .title :deep(.VPNavBarTitle) {
    display: none;
  }
}

@media (min-width: 1440px) {
  .VPNavBar.has-sidebar .title {
    padding-left: max(32px, calc((100% - (var(--vp-layout-max-width) - 64px)) / 2));
    width: calc((100% - (var(--vp-layout-max-width) - 64px)) / 2 + var(--vp-sidebar-width) - 32px);
  }

  .VPNavBar.has-sidebar.sidebar-collapsed .title {
    padding-left: 24px;
    width: auto;
  }

  .VPNavBar.has-sidebar.sidebar-collapsed .title :deep(.VPNavBarTitle) {
    display: none;
  }
}

.content {
  flex-grow: 1;
}

@media (min-width: 960px) {
  .VPNavBar.has-sidebar .content {
    position: relative;
    z-index: 1;
    padding-left: var(--vp-sidebar-width);
    padding-right: 32px;
    transition: padding-left 0.3s ease;
  }

  .VPNavBar.has-sidebar.sidebar-collapsed .content {
    padding-left: 0;
    background-color: var(--vp-nav-bg-color);
  }
}

@media (min-width: 1440px) {
  .VPNavBar.has-sidebar .content {
    padding-left: calc((100% - var(--vp-layout-max-width)) / 2 + var(--vp-sidebar-width));
    padding-right: calc((100% - var(--vp-layout-max-width)) / 2 + 32px);
  }

  .VPNavBar.has-sidebar.sidebar-collapsed .content {
    padding-left: 0;
    background-color: var(--vp-nav-bg-color);
  }
}

.content-body {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: var(--vp-nav-height);
  transition: background-color 0.5s;
}

@media (min-width: 960px) {
  .VPNavBar:not(.home.top) .content-body {
    position: relative;
    background-color: var(--vp-nav-bg-color);
  }

  .VPNavBar:not(.has-sidebar):not(.home.top) .content-body {
    background-color: transparent;
  }

  .content-body {
    margin-right: -100vw;
    padding-right: 100vw;
  }

  .VPNavBar.has-sidebar.sidebar-collapsed .content-body {
    margin-left: -32px;
    padding-left: 32px;
  }
}

@media (max-width: 767px) {
  .content-body {
    column-gap: 0.5rem;
  }
}

.menu + .translations::before,
.menu + .appearance::before,
.menu + .social-links::before,
.translations + .appearance::before,
.appearance + .social-links::before {
  margin-right: 8px;
  margin-left: 8px;
  width: 1px;
  height: 24px;
  background-color: var(--vp-c-divider);
  content: "";
}

.menu + .appearance::before,
.translations + .appearance::before {
  margin-right: 16px;
}

.appearance + .social-links::before {
  margin-left: 16px;
}

.social-links {
  margin-right: -8px;
}

/* Sidebar expand capsule - only show on desktop */
.expand-capsule {
  display: none;
}

@media (min-width: 960px) {
  .expand-capsule {
    display: flex;
    align-items: center;
    border: 1px solid var(--vp-c-divider);
    border-radius: 20px;
    background: var(--vp-c-bg);
    padding: 4px;
    margin-left: 12px;
    gap: 2px;
    box-shadow: var(--vp-shadow-1);
  }

  .capsule-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: none;
    border-radius: 50%;
    background: transparent;
    color: var(--vp-c-text-2);
    cursor: pointer;
    transition: color 0.25s, background-color 0.25s;
  }

  .capsule-btn:hover {
    color: var(--vp-c-text-1);
    background: var(--vp-c-default-soft);
  }

  .capsule-icon {
    width: 18px;
    height: 18px;
  }

  .capsule-divider {
    width: 1px;
    height: 16px;
    background: var(--vp-c-divider);
  }
}

.divider {
  width: 100%;
  height: 1px;
}

@media (min-width: 960px) {
  .VPNavBar.has-sidebar .divider {
    padding-left: var(--vp-sidebar-width);
    transition: padding-left 0.3s ease;
  }

  .VPNavBar.has-sidebar.sidebar-collapsed .divider {
    padding-left: 0;
  }

  .VPNavBar.has-sidebar.sidebar-collapsed .divider-line {
    background-color: var(--vp-c-gutter);
  }
}

@media (min-width: 1440px) {
  .VPNavBar.has-sidebar .divider {
    padding-left: calc((100% - (var(--vp-layout-max-width) - 64px)) / 2 + var(--vp-sidebar-width) - 32px);
  }

  .VPNavBar.has-sidebar.sidebar-collapsed .divider {
    padding-left: 0;
  }
}

.divider-line {
  width: 100%;
  height: 1px;
  transition: background-color 0.5s;
}

.VPNavBar:not(.home) .divider-line {
  background-color: var(--vp-c-gutter);
}

@media (min-width: 960px) {
  .VPNavBar:not(.home.top) .divider-line {
    background-color: var(--vp-c-gutter);
  }

  .VPNavBar:not(.has-sidebar):not(.home.top) .divider {
    background-color: var(--vp-c-gutter);
  }
}
</style>
