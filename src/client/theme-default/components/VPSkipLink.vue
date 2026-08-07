<script lang="ts" setup>
import { useRoute } from 'vitepress'
import { ref, watch } from 'vue'
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
  top: 0.5rem;
  left: 0.5rem;
  padding: 0.5rem 1rem;
  z-index: 999;
  border-radius: 0.5rem;
  font-size: 0.75rem;
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

@media (min-width: 80rem) {
  .VPSkipLink {
    top: 0.875rem;
    left: 1rem;
  }
}
</style>
