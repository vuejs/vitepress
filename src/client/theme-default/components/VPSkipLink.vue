<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vitepress'
import { useData } from '../composables/data'

const { theme } = useData()
const route = useRoute()
const backToTop = ref()

watch(() => route.path, () => backToTop.value.focus())
</script>

<template>
  <span ref="backToTop" tabindex="-1" />
  <a href="#VPContent" class="VPSkipLink visually-hidden">
    {{ theme.skipToContentLabel || 'Skip to content' }}
  </a>
</template>

<style scoped>
.VPSkipLink {
  position: fixed;
  top: 8px;
  left: 8px;
  padding: 8px 16px;
  z-index: 999;
  border-radius: 8px;
  font-size: 12px;
  font-weight: bold;
  text-decoration: none;
  color: var(--vp-c-brand-1);
  box-shadow: var(--vp-shadow-3);
  background-color: var(--vp-c-bg);
}

.VPSkipLink:focus {
  height: auto;
  width: auto;
  clip: auto;
  clip-path: none;
}

@media (min-width: 1280px) {
  .VPSkipLink {
    top: 14px;
    left: 16px;
  }
}
</style>
