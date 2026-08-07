<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'

const { width: vw } = useWindowSize({
  initialWidth: 0,
  includeScrollbar: false
})
</script>

<template>
  <div
    class="vp-doc container"
    :style="vw ? { '--vp-offset': `calc(50% - ${vw / 2}px)` } : {}"
    data-allow-mismatch="style"
  >
    <slot />
  </div>
</template>

<style scoped>
.container {
  margin: auto;
  width: 100%;
  max-width: 80rem;
  padding: 0 1.5rem;
}

@media (min-width: 40rem) {
  .container {
    padding: 0 3rem;
  }
}

@media (min-width: 60rem) {
  .container {
    width: 100%;
    padding: 0 4rem;
  }
}

.vp-doc :deep(.VPHomeSponsors),
.vp-doc :deep(.VPTeamPage) {
  margin-left: var(--vp-offset, calc(50% - 50vw));
  margin-right: var(--vp-offset, calc(50% - 50vw));
}

.vp-doc :deep(.VPHomeSponsors h2) {
  border-top: none;
  letter-spacing: normal;
}

.vp-doc :deep(.VPHomeSponsors a),
.vp-doc :deep(.VPTeamPage a) {
  text-decoration: none;
}
</style>
