<script lang="ts" setup>
import { useWindowScroll } from '@vueuse/core'
import { computed } from 'vue'

import { useData } from '../composables/data'
import { useLayout } from '../composables/layout'
import { provideNavOverflow } from '../composables/nav-overflow'
import VPNavAppearance from './VPNavAppearance.vue'
import VPNavBarExtra from './VPNavBarExtra.vue'
import VPNavBarHamburger from './VPNavBarHamburger.vue'
import VPNavBarSearch from './VPNavBarSearch.vue'
import VPNavBarTitle from './VPNavBarTitle.vue'
import VPNavMenu from './VPNavMenu.vue'
import VPNavSocialLinks from './VPNavSocialLinks.vue'
import VPNavTranslations from './VPNavTranslations.vue'

defineProps<{
  isScreenOpen: boolean
}>()

defineEmits<{
  (e: 'toggle-screen'): void
}>()

const { theme } = useData()
const { isHome, hasSidebar, hasLocalNav } = useLayout()

const { y } = useWindowScroll()
const isTop = computed(() => y.value <= 0)

const overflow = provideNavOverflow({
  itemsKey: () => JSON.stringify(theme.value.nav ?? null)
})
</script>

<template>
  <div
    class="VPNavBar"
    :class="{
      'has-sidebar': hasSidebar,
      'has-local-nav': !isHome && hasLocalNav,
      'home': isHome,
      'top': isTop,
      'screen-open': isScreenOpen
    }"
  >
    <div class="wrapper">
      <div class="container">
        <div class="title">
          <VPNavBarTitle>
            <template #nav-bar-title-before><slot name="nav-bar-title-before" /></template>
            <template #nav-bar-title-after><slot name="nav-bar-title-after" /></template>
          </VPNavBarTitle>
        </div>

        <div class="content">
          <div
            class="content-body"
            :ref="(el) => overflow.setContainerEl(el as HTMLElement | null)"
          >
            <slot name="nav-bar-content-before" />
            <VPNavBarSearch class="search" />
            <VPNavMenu class="menu" />
            <VPNavTranslations class="translations" />
            <VPNavAppearance class="appearance" />
            <VPNavSocialLinks class="social-links" />
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
    </div>

    <div class="divider">
      <div class="divider-line" />
    </div>
  </div>
</template>

<style scoped>
.VPNavBar {
  position: relative;
  z-index: 1;
  height: var(--vp-nav-height);
  pointer-events: none;
  white-space: nowrap;
  /* left edge of the background surface and divider — on doc pages the
     sidebar column paints its own surface up to this offset */
  --vp-nav-col-offset: 0px;
}

/* the single background surface — every state change below is color-only,
   so nothing ever moves */
.VPNavBar::before {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: var(--vp-nav-col-offset);
  z-index: -1;
  background-color: var(--vp-nav-bg-color);
  backdrop-filter: var(--vp-nav-backdrop-filter);
  transition: background-color 0.25s;
}

/* below 60rem the bar scrolls with the page, so home stays transparent */
.VPNavBar.home::before {
  background-color: transparent;
}

@media (min-width: 60rem) {
  .VPNavBar.home::before {
    background-color: var(--vp-nav-bg-color);
  }

  .VPNavBar.home.top::before {
    background-color: var(--vp-nav-home-bg-color);
    backdrop-filter: none;
  }

  .VPNavBar.has-sidebar {
    --vp-nav-col-offset: var(--vp-sidebar-width);
  }
}

@media (min-width: 90rem) {
  .VPNavBar.has-sidebar {
    --vp-nav-col-offset: calc(
      (100% - var(--vp-layout-max-width)) / 2 + var(--vp-sidebar-width)
    );
  }
}

.VPNavBar.screen-open::before {
  transition: none;
  background-color: var(--vp-nav-bg-color);
}

/* between 60rem and 80rem the local nav is pinned right under the bar and
   its surface extends up behind it, carrying the paint for both bars */
@media (60rem <= width < 80rem) {
  .VPNavBar.has-local-nav::before {
    background-color: transparent;
    backdrop-filter: none;
  }
}

.wrapper {
  padding: 0 0.5rem 0 1.5rem;
}

@media (min-width: 48rem) {
  .wrapper {
    padding: 0 2rem;
  }
}

.container {
  display: flex;
  justify-content: space-between;
  margin: 0 auto;
  max-width: calc(var(--vp-layout-max-width) - 4rem);
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

.title {
  /* below the overflow engine's range the title is the only shrinkable
     piece, truncating instead of running over search and the hamburger */
  min-width: 0;
}

@media (min-width: 48rem) {
  .title {
    /* the overflow engine measures fixed occupancy around a rigid title */
    flex-shrink: 0;
  }
}

@media (min-width: 60rem) {
  /* outside home the title column matches the sidebar column, so search and
     menu sit at the same spot on every doc page; on home the title keeps its
     natural width and search sits right next to it */
  .VPNavBar:not(.home) .title {
    min-width: calc(var(--vp-sidebar-width) - 2rem);
  }

  .VPNavBar.has-sidebar .title {
    max-width: calc(var(--vp-sidebar-width) - 2rem);
  }
}

.content {
  flex-grow: 1;
  /* below the engine's range the controls stay rigid and the title absorbs
     all the shrink */
  flex-shrink: 0;
}

@media (min-width: 48rem) {
  .content {
    flex-shrink: 1;
    min-width: 0;
  }
}

.content-body {
  position: relative;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: var(--vp-nav-height);
}

/* collapsed into the `⋯` menu — kept mounted (hidden, out of the a11y tree
   and tab order) so its natural width stays measurable */
.content-body > .collapsed {
  visibility: hidden;
  position: absolute;
  top: 0;
  left: 0;
  max-width: 100%;
  overflow: hidden;
}

/* separators between whichever cluster units are currently in the bar */
.content-body > :where(.menu, .translations, .appearance, .social-links) + :where(.translations, .appearance, .social-links)::before {
  margin-right: 0.5rem;
  margin-left: 0.5rem;
  width: 1px;
  height: 1.5rem;
  background-color: var(--vp-c-divider);
  content: "";
}

.content-body > :where(.menu, .translations) + .appearance::before {
  margin-right: 1rem;
}

.content-body > .appearance + .social-links::before {
  margin-left: 1rem;
}

.social-links {
  margin-right: -0.5rem;
}

.divider {
  position: relative;
  /* above the background surface, below the bar's content — an open flyout
     panel overlaps the bar's bottom edge and must cover the rule */
  z-index: -1;
  width: 100%;
  height: 1px;
  padding-left: var(--vp-nav-col-offset);
}

/* the sidebar-column segment of the bottom rule — inset from the column
   edges so it lines up with the sidebar's own group dividers */
.VPNavBar.has-sidebar .divider::before {
  content: "";
  position: absolute;
  top: 0;
  left: calc(var(--vp-nav-col-offset) - var(--vp-sidebar-width) + 2rem);
  width: calc(var(--vp-sidebar-width) - 4rem);
  height: 1px;
  background-color: var(--vp-c-divider);
}

.divider-line {
  width: 100%;
  height: 1px;
  transition: background-color 0.25s;
}

.VPNavBar:not(.home) .divider-line {
  background-color: var(--vp-nav-divider-color);
}

@media (min-width: 60rem) {
  .VPNavBar:not(.home.top) .divider-line {
    background-color: var(--vp-nav-divider-color);
  }
}

.VPNavBar.screen-open .divider-line {
  background-color: var(--vp-c-divider);
}
</style>
