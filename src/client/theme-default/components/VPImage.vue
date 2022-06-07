<script setup lang="ts">
import type { DefaultTheme } from 'vitepress/theme'

defineProps<{
  image: DefaultTheme.ThemeableImage
}>()
</script>

<template>
  <template v-if="image">
    <img
      v-if="typeof image === 'string' || 'src' in image"
      class="VPImage"
      v-bind="typeof image === 'string' ? { src: image } : image"
    >
    <template v-else>
      <VPImage class="dark" :image="image.dark" v-bind="$attrs"/>
      <VPImage class="light" :image="image.light" v-bind="$attrs"/>
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
