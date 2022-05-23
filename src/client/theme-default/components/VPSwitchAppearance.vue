<script lang="ts" setup>
import VPSwitch from './VPSwitch.vue'
import VPIconSun from './icons/VPIconSun.vue'
import VPIconMoon from './icons/VPIconMoon.vue'
import { useDark, useToggle } from '@vueuse/core'

const isDark = useDark()
const toggleDark = useToggle(isDark)
</script>

<template>
  <VPSwitch
    class="VPSwitchAppearance"
    aria-label="toggle dark mode"
    @click="toggleDark()"
    :aria-checked="isDark"
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
  transform: translateX(18px);
}
</style>
