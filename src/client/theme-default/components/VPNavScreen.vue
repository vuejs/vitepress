<script setup lang="ts">
import { onKeyStroke } from '@vueuse/core'
import { provide } from 'vue'

import { navScreenInjectionKey, useNav } from '../composables/nav'
import { useBodyScrollLock } from '../composables/scroll-lock'
import VPNavAppearance from './VPNavAppearance.vue'
import VPNavMenu from './VPNavMenu.vue'
import VPNavSocialLinks from './VPNavSocialLinks.vue'
import VPNavTranslations from './VPNavTranslations.vue'

const props = defineProps<{
  open: boolean
}>()

const isLocked = useBodyScrollLock()

provide(navScreenInjectionKey, true)

const { closeScreen, screenTriggerEl } = useNav()

onKeyStroke('Escape', () => {
  if (!props.open) return
  closeScreen()
  screenTriggerEl.value?.focus()
})
</script>

<template>
  <transition
    name="fade"
    @enter="isLocked = true"
    @after-leave="isLocked = false"
  >
    <div v-if="open" class="VPNavScreen" id="VPNavScreen">
      <div class="container">
        <slot name="nav-screen-content-before" />
        <VPNavMenu screen class="menu" />
        <VPNavTranslations screen class="translations" />
        <VPNavAppearance row screen class="appearance" />
        <VPNavSocialLinks screen class="social-links" />
        <slot name="nav-screen-content-after" />
      </div>
    </div>
  </transition>
</template>

<style scoped>
.VPNavScreen {
  position: fixed;
  top: 0;
  /*rtl:ignore*/
  right: 0;
  bottom: 0;
  /*rtl:ignore*/
  left: 0;
  padding: calc(var(--vp-nav-height) + var(--vp-layout-top-height, 0px) + 1px) 2rem 0;
  width: 100%;
  background-color: var(--vp-nav-screen-bg-color);
  overflow-y: auto;
  overscroll-behavior: contain;
  transition: background-color 0.25s;
  pointer-events: auto;
}

.VPNavScreen.fade-enter-active,
.VPNavScreen.fade-leave-active {
  transition: opacity 0.25s;
}

.VPNavScreen.fade-enter-active .container,
.VPNavScreen.fade-leave-active .container {
  transition: transform 0.25s ease;
}

.VPNavScreen.fade-enter-from,
.VPNavScreen.fade-leave-to {
  opacity: 0;
}

.VPNavScreen.fade-enter-from .container,
.VPNavScreen.fade-leave-to .container {
  transform: translateY(-0.5rem);
}

@media (min-width: 48rem) {
  .VPNavScreen {
    display: none;
  }
}

.container {
  margin: 0 auto;
  padding: 1.5rem 0 6rem;
  max-width: 18rem;
}

.menu + .translations,
.menu + .appearance,
.translations + .appearance {
  margin-top: 1.5rem;
}

.menu + .social-links {
  margin-top: 1rem;
}

.appearance + .social-links {
  margin-top: 1rem;
}
</style>
