<script setup lang="ts">
import { computed } from 'vue'
import type { DefaultTheme } from "vitepress/theme";
import VPImage from "./VPImage.vue";

const props = defineProps<{
  image: DefaultTheme.FeatureImage
}>()

const imageEntry = computed(() => {
  if (typeof props.image.path === 'string') {
    return props.image.path
  } else {
    return {
      dark: props.image.path.dark,
      light: props.image.path.light,
    }
  }
})
</script>

<template>
  <VPImage
    class="feature-image"
    :image="imageEntry"
    :alt="image.alt"
    :height="image.height"
    :widht="image.width"
  />
</template>

