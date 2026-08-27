<script lang="ts" setup>
import { inject, ref, watchPostEffect } from 'vue'

import { useData } from '../composables/data'
import VPSwitch from './VPSwitch.vue'

const { isDark, theme } = useData()

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
  <!-- stable name + aria-checked state; the title stays the action hint -->
  <VPSwitch
    :title="switchTitle"
    class="VPSwitchAppearance"
    :aria-label="theme.darkModeSwitchLabel || 'Appearance'"
    :aria-checked="isDark"
    @click="toggleAppearance"
  >
    <span class="vpi-sun sun" aria-hidden="true" />
    <span class="vpi-moon moon" aria-hidden="true" />
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
  transform: translateX(1.125rem);
}
</style>
