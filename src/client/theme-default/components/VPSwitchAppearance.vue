<script lang="ts" setup>
import { useData } from '../composables/data'
import VPSwitch from './VPSwitch.vue'
import VPIconMoon from './icons/VPIconMoon.vue'
import VPIconSun from './icons/VPIconSun.vue'

const { isDark } = useData()
</script>

<template>
  <VPSwitch
    title="toggle dark mode"
    class="VPSwitchAppearance"
    :aria-checked="isDark"
    @click="isDark = !isDark"
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
