<script lang="ts" setup>
import { inject } from 'vue'
import { useData } from '../composables/data'

const { isDark, theme } = useData()

const toggleAppearance = inject('toggle-appearance', () => {
  isDark.value = !isDark.value
})

function onClick(theme: 'light' | 'dark') {
  if ((theme === 'light' && isDark.value) || (theme === 'dark' && !isDark.value)) {
    toggleAppearance()
  }
}
</script>

<template>
  <div class="vp-switch-appearance">
    <button
      class="vp-switch-appearance__button"
      :class="{ 'vp-switch-appearance__button--is-active': !isDark }"
      :title="theme.lightModeSwitchTitle"
      @click="onClick('light')"
    >
      <span class="vp-switch-appearance__icon vpi-sun" />
    </button>
    <button
      class="vp-switch-appearance__button"
      :class="{ 'vp-switch-appearance__button--is-active': isDark }"
      :title="theme.darkModeSwitchTitle"
      @click="onClick('dark')"
    >
      <span class="vp-switch-appearance__icon vpi-moon" />
    </button>
  </div>
</template>

<style>
.vp-switch-appearance {
  display: flex;
  gap: 2px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  padding: 2px;
  width: 100%;
}

.vp-switch-appearance__button {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-grow: 1;
  border: 1px solid transparent;
  border-radius: 3px;
  height: 26px;
  color: var(--vp-c-text-2);
  overflow: hidden;
}

.vp-switch-appearance__button--is-active {
  border-color: var(--vp-c-divider);
  color: var(--vp-c-text-1);
  background-color: var(--vp-c-bg-3);
}

.vp-switch-appearance__icon {
  width: 14px;
  height: 14px;
}
</style>
