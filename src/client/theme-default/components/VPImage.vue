<script setup lang="ts">
import type { DefaultTheme } from 'vitepress/theme'
import { withBase } from 'vitepress'
import { computed, ref, useAttrs, watch } from 'vue'

const props = defineProps<{
  image: DefaultTheme.ThemeableImage
  alt?: string
}>()

const $attrs = useAttrs()
const elAttrs = computed(() => typeof props.image === 'string' ? $attrs : { ...props.image, ...$attrs })

const computedSrc = computed(() => withBase(typeof props.image === 'string' ? props.image : props.image.src))

const svgWrapperEl = ref<HTMLElement | null>(null)

watch(computedSrc, async () => {
  if (!computedSrc.value.endsWith('.svg')) {
    return
  }

  fetch(computedSrc.value)
    .then((res) => res.text())
    .then((data) => {
      svgWrapperEl.value!.innerHTML = data
      const svgEl = svgWrapperEl.value!.querySelector('svg')

      // iterate over all attributes and set them on the svg element
      for (const [key, value] of Object.entries(elAttrs.value)) {
        svgEl!.setAttribute(key, value as string)
      }
    })
}, { immediate: true })

defineOptions({ inheritAttrs: false })
</script>

<template>
  <template v-if="image">
    <template v-if="typeof image === 'string' || 'src' in image">
      <div v-if="computedSrc.endsWith('.svg')" ref="svgWrapperEl" class="VPImage" />
      <img
        v-else
        class="VPImage"
        v-bind="elAttrs"
        :src="computedSrc"
        :alt="alt ?? (typeof image === 'string' ? '' : image.alt || '')"
      />
    </template>
    <template v-else>
      <VPImage
        class="dark"
        :image="image.dark"
        :alt="image.alt"
        v-bind="$attrs"
      />
      <VPImage
        class="light"
        :image="image.light"
        :alt="image.alt"
        v-bind="$attrs"
      />
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
