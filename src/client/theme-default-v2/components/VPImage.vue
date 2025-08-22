<script setup lang="ts">
import type { DefaultTheme } from 'vitepress/theme'
import { withBase } from 'vitepress'

defineProps<{
  image: DefaultTheme.ThemeableImage
  alt?: string
}>()

defineOptions({ inheritAttrs: false })
</script>

<template>
  <template v-if="image">
    <img
      v-if="typeof image === 'string' || 'src' in image"
      class="vp-image"
      v-bind="typeof image === 'string' ? $attrs : { ...image, ...$attrs }"
      :src="withBase(typeof image === 'string' ? image : image.src)"
      :alt="alt ?? (typeof image === 'string' ? '' : image.alt || '')"
    />
    <template v-else>
      <VPImage
        class="vp-image--dark"
        :image="image.dark"
        :alt="image.alt"
        v-bind="$attrs"
      />
      <VPImage
        class="vp-image--light"
        :image="image.light"
        :alt="image.alt"
        v-bind="$attrs"
      />
    </template>
  </template>
</template>

<style>
html:not(.dark) .vp-image--dark {
  display: none;
}

.dark .vp-image--dark {
  display: none;
}
</style>
