<script lang="ts" setup>
import { inject, ref, watchPostEffect } from 'vue'
import { useData } from '../composables/data'
import type { AppearanceMode } from 'vitepress'

const { theme, appearanceMode } = useData()

const modes: AppearanceMode[] = ['auto', 'light', 'dark']

const toggleAppearance = inject('toggle-appearance', () => {
  const current = modes.indexOf(appearanceMode.value)
  appearanceMode.value = modes[(current + 1) % 3]
})

const switchTitle = ref('')

watchPostEffect(() => {
  const nextMode = modes[(modes.indexOf(appearanceMode.value) + 1) % 3]
  const titles: Record<AppearanceMode, string> = {
    auto: theme.value.autoModeSwitchTitle || 'Switch to system theme',
    light: theme.value.lightModeSwitchTitle || 'Switch to light theme',
    dark: theme.value.darkModeSwitchTitle || 'Switch to dark theme'
  }
  switchTitle.value = titles[nextMode]
})
</script>

<template>
  <button
    :title="switchTitle"
    class="VPSwitchAppearance"
    :class="`mode-${appearanceMode}`"
    :aria-label="switchTitle"
    @click="toggleAppearance"
  >
    <span class="vpi-sun sun" />
    <span class="vpi-moon moon" />
    <span class="vpi-system system" />
  </button>
</template>

<style scoped>
.VPSwitchAppearance {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 36px;
  height: 36px;
  color: var(--vp-c-text-2);
  transition: color 0.5s;
  cursor: pointer;
}

.VPSwitchAppearance:hover {
  color: var(--vp-c-text-1);
}

.sun,
.moon,
.system {
  position: absolute;
  width: 20px;
  height: 20px;
  opacity: 0;
  transition: opacity 0.25s ease;
}

.mode-light .sun {
  opacity: 1;
}

.mode-dark .moon {
  opacity: 1;
}

.mode-auto .system {
  opacity: 1;
}
</style>
