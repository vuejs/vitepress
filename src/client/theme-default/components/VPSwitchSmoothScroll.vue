<script lang="ts" setup>
import { SMOOTH_SCROLL_KEY } from '../../shared'
import VPSwitch from './VPSwitch.vue'
import VPIconSun from './icons/VPIconSun.vue'
import VPIconMoon from './icons/VPIconMoon.vue'

const toggle = typeof localStorage !== 'undefined' ? useSmoothScroll() : () => {}

function useSmoothScroll() {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)')
  const classList = document.documentElement.classList

  let userPreference = localStorage.getItem(SMOOTH_SCROLL_KEY) || 'auto'

  let isSmoothScroll = userPreference === 'auto'
    ? !query.matches
    : userPreference === 'no-preference'

  query.onchange = (e) => {
    if (userPreference === 'auto') {
      setClass((isSmoothScroll = !e.matches))
    }
  }

  function toggle() {
    setClass((isSmoothScroll = !isSmoothScroll))

    userPreference = isSmoothScroll
      ? query.matches ? 'auto' : 'no-preference'
      : 'no-preference'

    localStorage.setItem(SMOOTH_SCROLL_KEY, userPreference)
  }

  function setClass(smoothScroll: boolean): void {
    classList[smoothScroll ? 'add' : 'remove']('no-preference')
  }

  return toggle
}
</script>

<template>
  <VPSwitch
    class="VPSwitchSmoothScroll"
    aria-label="toggle smooth scroll mode"
    @click="toggle"
  >
    <VPIconSun class="reduce" />
    <VPIconMoon class="no-preference" />
  </VPSwitch>
</template>

<style scoped>
.reduce {
  opacity: 1;
}

.no-preference {
  opacity: 0;
}

.no-preference .reduce {
  opacity: 0;
}

.no-preference .no-preference {
  opacity: 1;
}

@media (prefers-reduced-motion: no-preference) {
  .no-preference .VPSwitchSmoothScroll :deep(.check) {
    transform: translateX(18px);
  }
}
</style>
