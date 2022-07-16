<script setup lang="ts">
defineProps<{
  title: string
  check: boolean
}>()
</script>

<template>
  <svg xmlns="http://www.w3.org/2000/svg"
       role="img"
       aria-labelledby="smooth-scroll-icon-off"
       focusable="false"
       class="smooth-scroll-icon-off"
       :class="{ check }"
       width="32"
       height="32"
       preserveAspectRatio="xMidYMid meet"
       viewBox="0 0 24 24">
    <title id="smooth-scroll-icon-off">
      {{ title }}
    </title>
    <path v-if="check" d="M5.293 5.293a1 1 0 0 1 1.414 0L12 10.586l5.293-5.293a1 1 0 1 1 1.414 1.414L13.414 12l5.293 5.293a1 1 0 0 1-1.414 1.414L12 13.414l-5.293 5.293a1 1 0 0 1-1.414-1.414L10.586 12L5.293 6.707a1 1 0 0 1 0-1.414z"></path>
    <path v-else fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m9 9l5 12l1.774-5.226L21 14L9 9zm7.071 7.071l4.243 4.243M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path>

  </svg>
</template>
<style scoped>
svg.smooth-scroll-icon-off {
  top: 2px;
  left: 2px;
  width: 14px;
  height: 14px;
}
svg.smooth-scroll-icon-off:not(.check) {
  color: var(--vp-c-text-2);
}
.dark svg.smooth-scroll-icon-off:not(.check) {
  color: var(--vp-c-text-1);
}
</style>
