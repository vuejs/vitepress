<script lang="ts" setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useData } from '../composables/data'
import { APPEARANCE_KEY } from '../../shared'
import VPSwitch from './VPSwitch.vue'
import VPIconSun from './icons/VPIconSun.vue'
import VPIconMoon from './icons/VPIconMoon.vue'

const { site, isDark } = useData()
const checked = ref(false)
const toggle = typeof localStorage !== 'undefined' ? useAppearance() : () => {}

onMounted(() => {
  checked.value = document.documentElement.classList.contains('dark')
})

const isAppearanceTransition = computed(() => {
  // @ts-expect-error: Transition API
  return document.startViewTransition && site.value.appearanceTransition
})

function useAppearance() {
  const query = window.matchMedia('(prefers-color-scheme: dark)')
  const classList = document.documentElement.classList

  let userPreference = localStorage.getItem(APPEARANCE_KEY)

  let isDark =
    (site.value.appearance === 'dark' && userPreference == null) ||
    (userPreference === 'auto' || userPreference == null
      ? query.matches
      : userPreference === 'dark')

  query.onchange = (e) => {
    if (userPreference === 'auto') {
      setClass((isDark = e.matches))
    }
  }

  function toggle(event: MouseEvent) {
    if (!isAppearanceTransition.value) {
      setClass((isDark = !isDark))

      userPreference = isDark
        ? query.matches ? 'auto' : 'dark'
        : query.matches ? 'light' : 'auto'

      localStorage.setItem(APPEARANCE_KEY, userPreference)

      return
    }

    const x = event.clientX
    const y = event.clientY
    const endRadius = Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y),
    )

    // @ts-expect-error: Transition API
    const transition = document.startViewTransition(() => {
      setClass((isDark = !isDark))

      userPreference = isDark
        ? query.matches ? 'auto' : 'dark'
        : query.matches ? 'light' : 'auto'

      localStorage.setItem(APPEARANCE_KEY, userPreference)
    })

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ]

      document.documentElement.animate(
        {
          clipPath: isDark ? clipPath : [...clipPath].reverse(),
        },
        {
          duration: 500,
          easing: 'ease-in',
          pseudoElement: isDark ? '::view-transition-new(root)' : '::view-transition-old(root)',
        },
      )
    })
  }

  function setClass(dark: boolean): void {
    const css = document.createElement('style')
    css.type = 'text/css'
    css.appendChild(
      document.createTextNode(
        `:not(.VPSwitchAppearance):not(.VPSwitchAppearance *) {
  -webkit-transition: none !important;
  -moz-transition: none !important;
  -o-transition: none !important;
  -ms-transition: none !important;
  transition: none !important;
}`
      )
    )
    document.head.appendChild(css)

    checked.value = dark
    classList[dark ? 'add' : 'remove']('dark')

    // @ts-expect-error keep unused declaration, used to force the browser to redraw
    const _ = window.getComputedStyle(css).opacity
    document.head.removeChild(css)
  }

  return toggle
}

watch(checked, (newIsDark) => {
  isDark.value = newIsDark
})
</script>

<template>
  <label title="toggle dark mode">
    <VPSwitch
      class="VPSwitchAppearance"
      :class="{ 'VPSwitchAppearanceTransition': isAppearanceTransition }"
      :aria-checked="checked"
      @click="toggle"
    >
      <VPIconSun class="sun" />
      <VPIconMoon class="moon" />
    </VPSwitch>
  </label>
</template>

<style scoped>
.sun {
  opacity: 1;
}

.moon {
  opacity: 0;
}

.dark .sun {
  opacity: 0;
}

.dark .moon {
  opacity: 1;
}

.VPSwitchAppearance.VPSwitchAppearanceTransition {
  width: 22px;
}

.dark .VPSwitchAppearance:not(.VPSwitchAppearanceTransition) :deep(.check) {
  /*rtl:ignore*/
  transform: translateX(18px);
}
</style>

<style>
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}

::view-transition-old(root) {
  z-index: 9999;
}

::view-transition-new(root) {
  z-index: 1;
}

.dark::view-transition-old(root) {
  z-index: 1;
}

.dark::view-transition-new(root) {
  z-index: 9999;
}
</style>