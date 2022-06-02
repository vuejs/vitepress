<script lang="ts" setup>
import { useSidebar } from '../composables/sidebar'
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
      <VPNavBarTitle />

      <div class="content">
        <VPNavBarSearch class="search" />
        <VPNavBarMenu class="menu" />
        <VPNavBarTranslations class="translations" />
        <VPNavBarAppearance class="appearance" />
        <VPNavBarSocialLinks class="social-links" />
        <VPNavBarExtra class="extra" />
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
  border-bottom: .0625rem solid var(--vp-c-divider-light);
  padding: 0 .5rem 0 1.5rem;
  height: var(--vp-nav-height-mobile);
  background-color: var(--vt-c-bg);
  transition: border-color 0.5s, background-color 0.5s;
}

@media (min-width: 768px) {
  .VPNavBar {
    padding: 0 2rem;
  }
}

@media (min-width: 960px) {
  .VPNavBar {
    height: var(--vp-nav-height-desktop);
    border-bottom: 0;
  }

  .VPNavBar.has-sidebar .content {
    backdrop-filter: saturate(50%) blur(8px);
    -webkit-backdrop-filter: saturate(50%) blur(8px);
  }

  @supports not (backdrop-filter: saturate(50%) blur(8px)) {
    .VPNavBar.has-sidebar .content {
      background: rgba(255, 255, 255, 0.95);
    }

    .dark .VPNavBar.has-sidebar .content {
      background: rgba(36, 36, 36, 0.95);
    }
  }
}

.container {
  display: flex;
  justify-content: space-between;
  margin: 0 auto;
  max-width: calc(var(--vp-layout-max-width) - 4rem);
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
  margin-right: .5rem;
  margin-left: .5rem;
  width: .0625rem;
  height: 1.5rem;
  background-color: var(--vp-c-divider-light);
  content: "";
}

.menu + .appearance::before,
.translations + .appearance::before {
  margin-right: 1rem;
}

.appearance + .social-links::before {
  margin-left: 1rem;
}

.social-links {
  margin-right: -0.5rem;
}
</style>
