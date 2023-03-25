<script lang="ts" setup>
import { SMOOTH_SCROLL_KEY } from '../../shared'
import VPSwitch from './VPSwitch.vue'
import VPIconSmoothScrollOn from './icons/VPIconSmoothScrollOn.vue'
import VPIconSmoothScrollOff from './icons/VPIconSmoothScrollOff.vue'
import { ref } from 'vue'

withDefaults(defineProps<{
  screen?: boolean
}>(), { screen: false })

const isSmoothScroll = ref(false)

const toggle = typeof localStorage !== 'undefined' ? useSmoothScroll() : () => {}

function useSmoothScroll() {
  const classList = document.documentElement.classList
  // reduce will be used only while the user don't click the switcher
  let userPreference = localStorage.getItem(SMOOTH_SCROLL_KEY) || 'reduce'
  isSmoothScroll.value = userPreference === 'no-preference'
  setClass(isSmoothScroll.value)
  function toggle() {
    setClass((isSmoothScroll.value = !isSmoothScroll.value))
    userPreference = isSmoothScroll.value ? 'no-preference' : 'reduce'
    localStorage.setItem(SMOOTH_SCROLL_KEY, userPreference)
  }
  function setClass(smoothScroll: boolean): void {
    classList.remove('smooth-scroll-on', 'smooth-scroll-off')
    classList.add(smoothScroll ? 'smooth-scroll-on' : 'smooth-scroll-off')
  }
  return toggle
}
</script>

<template>
  <label title="toggle smooth scroll mode">
    <VPSwitch
        class="VPSwitchSmoothScroll"
        :aria-checked="isSmoothScroll"
        @click="toggle"
    >
      <VPIconSmoothScrollOff :check="screen" class="reduce" />
      <VPIconSmoothScrollOn :check="screen" class="no-preference" />
    </VPSwitch>
  </label>
</template>

<style scoped>
.reduce {
  opacity: 1;
}
.no-preference {
  opacity: 0;
}
.smooth-scroll-on .reduce {
  opacity: 0;
}
.smooth-scroll-on .no-preference {
  opacity: 1;
}
.smooth-scroll-on .VPSwitchSmoothScroll :deep(.check) {
  transform: translateX(18px);
}
</style>
