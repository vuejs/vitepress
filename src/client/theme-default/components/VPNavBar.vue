<script lang="ts" setup>
import { useSidebar } from '../composables/sidebar.js'
import VPNavBarTitle from './VPNavBarTitle.vue'
import VPNavBarSearch from './VPNavBarSearch.vue'
import VPNavBarMenu from './VPNavBarMenu.vue'
import VPNavBarTranslations from './VPNavBarTranslations.vue'
import VPNavBarAppearance from './VPNavBarAppearance.vue'
import VPNavBarSocialLinks from './VPNavBarSocialLinks.vue'
import VPNavBarExtra from './VPNavBarExtra.vue'
import VPNavBarHamburger from './VPNavBarHamburger.vue'

defineProps<{
  isScreenOpen: boolean
}>()

defineEmits<{
  (e: 'toggle-screen'): void
}>()

const { hasSidebar } = useSidebar()
</script>

<template>
  <div class="VPNavBar" :class="{ 'has-sidebar' : hasSidebar }">
    <div class="container">
      <div class="title">
        <VPNavBarTitle>
          <template #nav-bar-title-before><slot name="nav-bar-title-before" /></template>
          <template #nav-bar-title-after><slot name="nav-bar-title-after" /></template>
        </VPNavBarTitle>
      </div>

      <div class="content">
        <div class="curtain" />
        <slot name="nav-bar-content-before" />
        <VPNavBarSearch class="search" />
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
</template>

<style scoped>
.VPNavBar {
  position: relative;
  border-bottom: 1px solid var(--vp-c-gutter);
  padding: 0 8px 0 24px;
  height: var(--vp-nav-height);
  transition: border-color 0.5s, background-color 0.5s;
  pointer-events: none;
}

@media (min-width: 768px) {
  .VPNavBar {
    padding: 0 32px;
  }
}

@media (min-width: 960px) {
  .VPNavBar.has-sidebar {
    border-bottom-color: transparent;
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

@media (min-width: 960px) {
  .VPNavBar.has-sidebar .container {
    max-width: 100%;
  }
}

.title {
  flex-shrink: 0;
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
    background-color: var(--vp-c-bg-alt);
  }
}

@media (min-width: 1440px) {
  .VPNavBar.has-sidebar .title {
    padding-left: max(32px, calc((100% - (var(--vp-layout-max-width) - 64px)) / 2));
    width: calc((100% - (var(--vp-layout-max-width) - 64px)) / 2 + var(--vp-sidebar-width) - 32px);
  }
}

.container :deep(*) {
  pointer-events: auto;
}

.content {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  flex-grow: 1;
}

@media (min-width: 960px) {
  .VPNavBar.has-sidebar .content {
    position: relative;
    z-index: 1;
    padding-right: 32px;
    padding-left: var(--vp-sidebar-width);
  }
}

@media (min-width: 1440px) {
  .VPNavBar.has-sidebar .content {
    padding-right: calc((100vw - var(--vp-layout-max-width)) / 2 + 32px);
    padding-left: calc((100vw - var(--vp-layout-max-width)) / 2 + var(--vp-sidebar-width));
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

@media (min-width: 960px) {
  .VPNavBar.has-sidebar .curtain {
    position: absolute;
    right: 0;
    bottom: -32px;
    width: calc(100% - var(--vp-sidebar-width));
    height: 32px;
  }

  .VPNavBar.has-sidebar .curtain::before {
    display: block;
    width: 100%;
    height: 32px;
    background: linear-gradient(var(--vp-c-bg), transparent 70%);
    content: "";
  }
}

@media (min-width: 1440px) {
  .VPNavBar.has-sidebar .curtain {
    width: calc(100% - ((100vw - var(--vp-layout-max-width)) / 2 + var(--vp-sidebar-width)));
  }
}
</style>
