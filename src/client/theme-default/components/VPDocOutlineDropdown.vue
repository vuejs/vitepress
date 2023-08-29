<script setup lang="ts">
import { ref, shallowRef } from 'vue'
import { useData } from '../composables/data'
import { getHeaders, resolveTitle, type MenuItem } from '../composables/outline'
import VPDocOutlineItem from './VPDocOutlineItem.vue'
import { onContentUpdated } from 'vitepress'
import VPIconChevronRight from './icons/VPIconChevronRight.vue'

const { frontmatter, theme } = useData()
const open = ref(false)

onContentUpdated(() => {
  open.value = false
})

const headers = shallowRef<MenuItem[]>([])

onContentUpdated(() => {
  headers.value = getHeaders(
    frontmatter.value.outline ?? theme.value.outline
  )
})
</script>

<template>
  <div class="VPDocOutlineDropdown" v-if="headers.length > 0">
    <button @click="open = !open" :class="{ open }">
      {{ resolveTitle(theme) }}
      <VPIconChevronRight class="icon" />
    </button>
    <div class="items" v-if="open">
      <VPDocOutlineItem :headers="headers" />
    </div>
  </div>
</template>

<style scoped>
.VPDocOutlineDropdown {
  margin-bottom: 48px;
}

.VPDocOutlineDropdown button {
  display: block;
  font-size: 14px;
  font-weight: 500;
  line-height: 24px;
  border: 1px solid var(--vp-c-border);
  padding: 4px 12px;
  color: var(--vp-c-text-2);
  background-color: var(--vp-c-default-soft);
  border-radius: 8px;
  transition: color 0.5s;
}

.VPDocOutlineDropdown button:hover {
  color: var(--vp-c-text-1);
  transition: color 0.25s;
}

.VPDocOutlineDropdown button.open {
  color: var(--vp-c-text-1);
}

.icon {
  display: inline-block;
  vertical-align: middle;
  width: 16px;
  height: 16px;
  fill: currentColor;
}

:deep(.outline-link) {
  font-size: 14px;
  font-weight: 400;
}

.open > .icon {
  transform: rotate(90deg);
}

.items {
  margin-top: 12px;
  border-left: 1px solid var(--vp-c-divider);
}
</style>
