<script lang="ts" setup>
import VPSwitchAppearance from './VPSwitchAppearance.vue'
</script>

<template>
  <div class="VPNavBarAppearance">
    <VPSwitchAppearance />
  </div>
</template>

<style scoped>
.VPNavBarAppearance {
  display: none;
}

@media (min-width: 1280px) {
  .VPNavBarAppearance {
    display: flex;
    align-items: center;
  }
}
</style>
