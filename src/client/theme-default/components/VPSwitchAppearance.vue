<script lang="ts" setup>
import { ref, watchPostEffect } from 'vue'
import { useData } from '../composables/data'
import VPSwitch from './VPSwitch.vue'
import { useDark } from '../composables/dark'

const { theme } = useData()
const { isDark, toggleAppearance } = useDark({ triggerPrint: true });

const switchTitle = ref('')

watchPostEffect(() => {
  switchTitle.value = isDark.value
    ? theme.value.lightModeSwitchTitle || 'Switch to light theme'
    : theme.value.darkModeSwitchTitle || 'Switch to dark theme'
})
</script>

<template>
  <VPSwitch
    :title="switchTitle"
    class="VPSwitchAppearance"
    :aria-checked="isDark"
    @click="toggleAppearance"
  >
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
