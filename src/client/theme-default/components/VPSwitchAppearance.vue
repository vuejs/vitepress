<script lang="ts" setup>
import { inject, computed } from 'vue'
import { useData } from '../composables/data'
import VPSwitch from './VPSwitch.vue'
import VPIconMoon from './icons/VPIconMoon.vue'
import VPIconSun from './icons/VPIconSun.vue'

const { isDark, theme } = useData()

const toggleAppearance = inject('toggle-appearance', () => {
  isDark.value = !isDark.value
})

const lightModeSwitchTitle = computed(() => theme.value.lightModeSwitchTitle || 'Switch to light theme')

const darkModeSwitchLabel = computed(() => theme.value.darkModeSwitchTitle || 'Switch to dark theme')

const switchTitle = computed(() => {
  return isDark.value ? lightModeSwitchTitle.value : darkModeSwitchLabel.value
})
</script>

<template>
  <VPSwitch
    :title="switchTitle"
    class="VPSwitchAppearance"
    :aria-checked="isDark"
    @click="toggleAppearance"
  >
    <VPIconSun class="sun" />
    <VPIconMoon class="moon" />
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
