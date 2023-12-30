<script setup lang="ts">
import { onContentUpdated } from 'vitepress'
import { ref, shallowRef } from 'vue'
import { useData } from '../composables/data'
import {
  getHeaders,
  resolveTitle,
  useActiveAnchor,
  type MenuItem
} from '../composables/outline'
import VPDocOutlineItem from './VPDocOutlineItem.vue'

const { frontmatter, theme } = useData()

const headers = shallowRef<MenuItem[]>([])

onContentUpdated(() => {
  headers.value = getHeaders(frontmatter.value.outline ?? theme.value.outline)
})

const container = ref()
const marker = ref()

useActiveAnchor(container, marker)
</script>

<template>
  <div
    class="VPDocAsideOutline"
    :class="{ 'has-outline': headers.length > 0 }"
    ref="container"
    role="navigation"
  >
    <div class="content">
      <div class="outline-marker" ref="marker" />

      <div class="outline-title" role="heading" aria-level="2">{{ resolveTitle(theme) }}</div>

      <nav aria-labelledby="doc-outline-aria-label">
        <span class="visually-hidden" id="doc-outline-aria-label">
          Table of Contents for current page
        </span>
        <VPDocOutlineItem :headers="headers" :root="true" />
      </nav>
    </div>
  </div>
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
