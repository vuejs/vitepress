<script setup lang="ts">
import type { DefaultTheme } from 'vitepress/theme'
import { computed } from 'vue';

const props = defineProps<{
  image: DefaultTheme.ThemeableImage,
  class?: string
}>()

const normalized = computed(() => typeof props.image === 'string' ? { src: props.image } : props.image)
</script>

<template>
  <template v-if="normalized">
    <img v-if="'src' in normalized" class="VPImage" v-bind="normalized" :class="props.class">
    <template v-else-if="'dark' in normalized">
      <VPImage :image="normalized.dark" class="dark" :class="props.class" />
      <VPImage :image="normalized.light" class="light" :class="props.class" />
    </template>
  </template>
</template>

<style scoped>
html:not(.dark) .VPImage.dark {
  display: none;
}
.dark .VPImage.light {
  display: none;
}
</style>
