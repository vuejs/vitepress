<script setup lang="ts">
import { useRoute } from 'vitepress'
import type { DefaultTheme } from 'vitepress/theme'
import { onMounted, ref, watch } from 'vue'
import { useAside } from '../composables/aside'

const route = useRoute()
const props = defineProps<{
  carbonAds: DefaultTheme.CarbonAdsOptions
}>()

const carbonOptions = props.carbonAds

const { isAsideEnabled } = useAside()
const container = ref()

let isInitialized = false

function init() {
  if (!isInitialized) {
    isInitialized = true
    const params = new URLSearchParams({
      serve: carbonOptions.code,
      placement: carbonOptions.placement,
      format: carbonOptions?.format || 'classic',
    })
    const s = document.createElement('script')
    s.id = '_carbonads_js'
    s.src = `//cdn.carbonads.com/carbon.js?${params.toString()}`
    s.async = true
    container.value.appendChild(s)
  }
}

watch(() => route.data.relativePath, () => {
  if (isInitialized && isAsideEnabled.value) {
    ;(window as any)._carbonads?.refresh()
  }
})

// no need to account for option changes during dev, we can just
// refresh the page
if (carbonOptions) {
  onMounted(() => {
    // if the page is loaded when aside is active, load carbon directly.
    // otherwise, only load it if the page resizes to wide enough. this avoids
    // loading carbon at all on mobile where it's never shown
    if (isAsideEnabled.value) {
      init()
    } else {
      watch(isAsideEnabled, (wide) => wide && init())
    }
  })
}
</script>

<template>
  <div class="VPCarbonAds" ref="container" />
</template>

<style scoped>
.VPCarbonAds {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1.5rem;
  border-radius: 0.75rem;
  min-height: 16rem;
  text-align: center;
  line-height: 1.125rem;
  font-size: 0.75rem;
  font-weight: 500;
  background-color: var(--vp-carbon-ads-bg-color);
}

.VPCarbonAds :deep(img) {
  margin: 0 auto;
  border-radius: 0.375rem;
}

.VPCarbonAds :deep(.carbon-text) {
  display: block;
  margin: 0 auto;
  padding-top: 0.75rem;
  color: var(--vp-carbon-ads-text-color);
  transition: color 0.25s;
}

.VPCarbonAds :deep(.carbon-text:hover) {
  color: var(--vp-carbon-ads-hover-text-color);
}

.VPCarbonAds :deep(.carbon-poweredby) {
  display: block;
  padding-top: 0.375rem;
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--vp-carbon-ads-poweredby-color);
  text-transform: uppercase;
  transition: color 0.25s;
}

.VPCarbonAds :deep(.carbon-poweredby:hover) {
  color: var(--vp-carbon-ads-hover-poweredby-color);
}

.VPCarbonAds :deep(> div) {
  display: none;
}

.VPCarbonAds :deep(> div:first-of-type) {
  display: block;
}
</style>
