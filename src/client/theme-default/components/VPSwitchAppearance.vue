<script lang="ts" setup>
import { inject, ref, watchPostEffect } from 'vue'
import { useData } from '../composables/data'
import VPSwitch from './VPSwitch.vue'

const { isDark, theme } = useData()

const handleClick = async () => {
  try {
    const result = await beforeThemeSwitch()
    if (result !== false) {
      toggleAppearance()
    }
  } catch (e) {
    console.error('[VitePress] Error in before-appearance-switch hook:', e)
  }
}

type BeforeSwitchHook = () => boolean | Promise<boolean> | void

const beforeThemeSwitch = inject<BeforeSwitchHook>(
  'before-appearance-switch',
  () => true
)

const toggleAppearance = inject('toggle-appearance', () => {
  isDark.value = !isDark.value
})

const switchTitle = ref('')

watchPostEffect(() => {
  switchTitle.value = isDark.value
    ? theme.value.lightModeSwitchTitle || 'Switch to light theme'
    : theme.value.darkModeSwitchTitle || 'Switch to dark theme'
})
</script>

<template>
  <VPSwitch :title="switchTitle" class="VPSwitchAppearance" :aria-checked="isDark" @click="handleClick">
    <span class="vpi-sun sun" />
    <span class="vpi-moon moon" />
  </VPSwitch>
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

.dark .VPSwitchAppearance :deep(.check) {
  /*rtl:ignore*/
  transform: translateX(18px);
}
</style>
