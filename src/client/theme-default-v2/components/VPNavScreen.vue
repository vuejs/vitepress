<script setup lang="ts">
import { useScrollLock } from '@vueuse/core'
import { inBrowser } from 'vitepress'
import { ref } from 'vue'
import VPNavScreenMenu from './VPNavScreenMenu.vue'
import VPNavScreenSocialLinks from './VPNavScreenSocialLinks.vue'
import VPNavScreenActions from './VPNavScreenActions.vue'

defineProps<{
  open: boolean
}>()

const screen = ref<HTMLElement | null>(null)
const isLocked = useScrollLock(inBrowser ? document.body : null)
</script>

<template>
  <transition
    name="fade"
    @enter="isLocked = true"
    @after-leave="isLocked = false"
  >
    <div v-if="open" class="vp-nav-screen" ref="screen" id="VPNavScreen">
      <div class="vp-nav-screen__container">
        <slot name="nav-screen-content-before" />
        <VPNavScreenMenu />
        <VPNavScreenActions />
        <VPNavScreenSocialLinks />
        <slot name="nav-screen-content-after" />
      </div>
    </div>
  </transition>
</template>

<style>
.vp-nav-screen {
  position: fixed;
  top: calc(var(--vp-nav-height) + var(--vp-layout-top-height, 0px));
  /*rtl:ignore*/
  right: 0;
  bottom: 0;
  /*rtl:ignore*/
  left: 0;
  padding: 0 24px;
  width: 100%;
  background-color: var(--vp-nav-screen-bg-color);
  overflow-y: auto;
  transition: background-color 0.25s;
  pointer-events: auto;

  @media (min-width: 768px) {
    display: none;
  }
}

.vp-nav-screen.fade-enter-active,
.vp-nav-screen.fade-leave-active {
  transition: opacity 0.25s;

  .vp-nav-screen__container {
    transition: transform 0.25s ease;
  }
}

.vp-nav-screen.fade-enter-from,
.vp-nav-screen.fade-leave-to {
  opacity: 0;

  .vp-nav-screen__container {
    transform: translateY(-8px);
  }
}

.vp-nav-screen__container {
  margin: 0 auto;
  padding: 24px 0 96px;
  max-width: 288px;
}

.vp-nav-screen-menu + .vp-nav-screen-actions,
.vp-nav-screen-menu + .vp-nav-screen-social-links {
  margin-top: 32px;
}

.vp-nav-screen-actions + .vp-nav-screen-social-links {
  margin-top: 24px;
}
</style>
