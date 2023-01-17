<script setup lang="ts">
import type { DefaultTheme } from 'vitepress/theme'
import { computed, inject, ref, type Ref } from 'vue'
import { useData } from '../composables/data.js'
import {
  getHeaders,
  useActiveAnchor,
  type MenuItem
} from '../composables/outline.js'
import VPDocAsideOutlineItem from './VPDocAsideOutlineItem.vue'

const { frontmatter, theme } = useData()

const pageOutline = computed<DefaultTheme.Config['outline']>(
  () => frontmatter.value.outline ?? theme.value.outline
)

const onContentUpdated = inject('onContentUpdated') as Ref<() => void>
onContentUpdated.value = () => {
  headers.value = getHeaders(pageOutline.value)
}

const headers = ref<MenuItem[]>([])
const hasOutline = computed(() => headers.value.length > 0)

const container = ref()
const marker = ref()

useActiveAnchor(container, marker)

function handleClick({ target: el }: Event) {
  const id = '#' + (el as HTMLAnchorElement).href!.split('#')[1]
  const heading = document.querySelector<HTMLAnchorElement>(
    decodeURIComponent(id)
  )
  heading?.focus()
}
</script>

<template>
  <div class="VPDocAsideOutline" :class="{ 'has-outline': hasOutline }" ref="container">
    <div class="content">
      <div class="outline-marker" ref="marker" />

      <div class="outline-title">
        {{
          (typeof theme.outline === 'object' &&
            !Array.isArray(theme.outline) &&
            theme.outline.label) ||
          theme.outlineTitle ||
          'On this page'
        }}
      </div>

      <nav aria-labelledby="doc-outline-aria-label">
        <span class="visually-hidden" id="doc-outline-aria-label">
          Table of Contents for current page
        </span>
        <VPDocAsideOutlineItem :headers="headers" :root="true" :onClick="handleClick" />
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
  width: 1px;
  height: 18px;
  background-color: var(--vp-c-brand);
  transition: top 0.25s cubic-bezier(0, 1, 0.5, 1), background-color 0.5s, opacity 0.25s;
}

.outline-title {
  letter-spacing: 0.4px;
  line-height: 28px;
  font-size: 13px;
  font-weight: 600;
}
</style>
