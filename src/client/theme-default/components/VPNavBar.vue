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
      <VPNavBarTitle>
        <template #nav-bar-title-before><slot name="nav-bar-title-before" /></template>
        <template #nav-bar-title-after><slot name="nav-bar-title-after" /></template>
      </VPNavBarTitle>

      <div class="content">
        <slot name="nav-bar-content-before" />
        <VPNavBarSearch class="search" />
        <VPNavBarMenu class="menu" />
        <VPNavBarTranslations class="translations" />
        <VPNavBarAppearance class="appearance" />
        <VPNavBarSocialLinks class="social-links" />
        <VPNavBarExtra class="extra" />
        <slot name="nav-bar-content-after" />
        <VPNavBarHamburger
          class="hamburger"
          :active="isScreenOpen"
          @click="$emit('toggle-screen')"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.VPNavBar {
  position: relative;
  border-bottom: 1px solid var(--vp-c-divider-light);
  padding: 0 8px 0 24px;
  height: var(--vp-nav-height-mobile);
  transition: border-color 0.5s, background-color 0.5s;
  pointer-events: none;
}

@media (min-width: 768px) {
  .VPNavBar {
    padding: 0 32px;
  }
}

@media (min-width: 960px) {
  .VPNavBar {
    height: var(--vp-nav-height-desktop);
    border-bottom: 0;
  }

  .VPNavBar.has-sidebar .content {
    margin-right: -100vw;
    padding-right: 100vw;
    background: var(--vp-c-bg-alpha-without-backdrop);
  }

  @supports (
    (backdrop-filter: saturate(50%) blur(8px)) or
      (-webkit-backdrop-filter: saturate(50%) blur(8px))
  ) {
    .VPNavBar.has-sidebar .content {
      -webkit-backdrop-filter: saturate(50%) blur(8px);
      backdrop-filter: saturate(50%) blur(8px);
      background: var(--vp-c-bg-alpha-with-backdrop);
    }
  }
}

.container {
  display: flex;
  justify-content: space-between;
  margin: 0 auto;
  max-width: calc(var(--vp-layout-max-width) - 64px);
  pointer-events: none;
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

.menu + .translations::before,
.menu + .appearance::before,
.menu + .social-links::before,
.translations + .appearance::before,
.appearance + .social-links::before {
  margin-right: 8px;
  margin-left: 8px;
  width: 1px;
  height: 24px;
  background-color: var(--vp-c-divider-light);
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
</style>
