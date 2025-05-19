<script setup lang="ts">
import { ref } from 'vue'
import { useData } from '../composables/data'
import { resolveTitle, useActiveAnchor } from '../composables/outline'
import VPDocOutlineItem from './VPDocOutlineItem.vue'
import { useLayout } from '../composables/layout'

const { theme } = useData()

const container = ref()
const marker = ref()

const { headers, hasLocalNav } = useLayout()

useActiveAnchor(container, marker)
</script>

<template>
  <nav
    aria-labelledby="doc-outline-aria-label"
    class="VPDocAsideOutline"
    :class="{ 'has-outline': hasLocalNav }"
    ref="container"
  >
    <div class="content">
      <div class="outline-marker" ref="marker" />

      <div
        aria-level="2"
        class="outline-title"
        id="doc-outline-aria-label"
        role="heading"
      >
        {{ resolveTitle(theme) }}
      </div>

      <VPDocOutlineItem :headers :root="true" />
    </div>
  </nav>
</template>

<style scoped>
.VPDocAsideOutline {
  display: none;
}

.VPDocAsideOutline.has-outline {
  display: block;
}

.content {
  position: relative;
  border-left: 1px solid var(--vp-c-divider);
  padding-left: 16px;
  font-size: 13px;
  font-weight: 500;
}

.outline-marker {
  position: absolute;
  top: 32px;
  left: -1px;
  z-index: 0;
  opacity: 0;
  width: 2px;
  border-radius: 2px;
  height: 18px;
  background-color: var(--vp-c-brand-1);
  transition:
    top 0.25s cubic-bezier(0, 1, 0.5, 1),
    background-color 0.5s,
    opacity 0.25s;
}

.outline-title {
  line-height: 32px;
  font-size: 14px;
  font-weight: 600;
}
</style>
