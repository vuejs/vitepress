<script lang="ts" setup>
import { useWindowScroll } from '@vueuse/core'
import { ref, watchPostEffect } from 'vue'
import { useLayout } from '../composables/layout'
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
  'toggle-screen': []
}>()

const { y } = useWindowScroll()
const { isHome, hasSidebar } = useLayout()

const classes = ref<Record<string, boolean>>({})

// TODO: Organize these classes.
watchPostEffect(() => {
  classes.value = {
    'has-sidebar': hasSidebar.value,
    'home': isHome.value,
    'vp-nav-bar__has-scrolled': y.value > 0,
    'vp-nav-bar__is-screen-open': props.isScreenOpen
  }
})
</script>

<template>
  <div class="vp-nav-bar" :class="classes">
    <div class="vp-nav-bar__wrapper">
      <div class="vp-nav-bar__container">
        <div class="vp-nav-bar__title">
          <VPNavBarTitle>
            <template #nav-bar-title-before><slot name="nav-bar-title-before" /></template>
            <template #nav-bar-title-after><slot name="nav-bar-title-after" /></template>
          </VPNavBarTitle>
        </div>

        <div class="vp-nav-bar__content">
          <div class="vp-nav-bar__content-body">
            <slot name="nav-bar-content-before" />
            <VPNavBarSearch />
            <VPNavBarMenu class="menu" />
            <VPNavBarTranslations class="translations" />
            <VPNavBarAppearance class="appearance" />
            <VPNavBarSocialLinks class="social-links" />
            <VPNavBarExtra class="extra" />
            <slot name="nav-bar-content-after" />
            <VPNavBarHamburger :active="isScreenOpen" @click="$emit('toggle-screen')" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.vp-nav-bar {
  position: relative;
  /* TODO: Maybe consider a way to customize the border via css var? */
  border-bottom: 1px solid var(--vp-c-gutter);
  height: var(--vp-nav-height);
  white-space: nowrap;
  transition: background-color 0.25s;

  /* TODO: Why do we need this? */
  /* pointer-events: none; */
}

.vp-nav-bar__has-scrolled {
  @media (min-width: 1024px) {
    background-color: var(--vp-nav-bg-color);
  }
}

.vp-nav-bar__is-screen-open {
  background-color: var(--vp-nav-bg-color);
  transition: none;
}

.vp-nav-bar__wrapper {
  padding: 0 12px 0 24px;

  @media (min-width: 768px) {
    padding: 0 32px;
  }
}

@media (min-width: 960px) {
  .VPNavBar.has-sidebar .wrapper {
    padding: 0;
  }
}

.vp-nav-bar__container {
  display: flex;
  justify-content: space-between;
  margin: 0 auto;
  /* pointer-events: none; */
}

/* .vp-nav-bar__container > .title, */
/* .vp-nav-bar__container > .content { */
  /* pointer-events: none; */
/* } */

/* .vp-nav-bar__container :deep(*) { */
  /* pointer-events: auto; */
/* } */

.vp-nav-bar__title {
  flex-shrink: 0;
}

.vp-nav-bar__content {
  flex-grow: 1;
}

.vp-nav-bar__content-body {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

/* @media (max-width: 767px) {
  .content-body {
    column-gap: 0.5rem;
  }
} */

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
</style>
