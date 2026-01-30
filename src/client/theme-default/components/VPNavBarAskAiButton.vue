<script lang="ts" setup>
defineProps<{
  text: string
  label: string
}>()
</script>

<template>
  <button type="button" class="VPNavBarAskAiButton" :aria-label="label">
    {{ text }}
  </button>
</template>

<style scoped></style>
