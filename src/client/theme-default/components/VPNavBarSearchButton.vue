<script lang="ts" setup>
defineProps<{
  text: string
  label: string
}>()
</script>

<template>
  <button type="button" class="VPNavBarSearchButton" :aria-label="label">
    {{ text }}
  </button>
</template>

<style scoped></style>
