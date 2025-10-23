<script lang="ts" setup>
import type { DefaultTheme } from 'vitepress/theme'
import { computed, inject } from 'vue'
import { useData } from '../composables/data'
import { navInjectionKey } from '../composables/nav'
import VPLink from './VPLink.vue'

const props = defineProps<{
  item: DefaultTheme.NavItemWithLink
}>()

const { page } = useData()

const href = computed(() =>
  typeof props.item.link === 'function'
    ? props.item.link(page.value)
    : props.item.link
)

const { closeScreen } = inject(navInjectionKey)!
</script>

<template>
  <VPLink
    class="VPNavScreenMenuLink"
    :href
    :target="item.target"
    :rel="item.rel"
    :no-icon="item.noIcon"
    @click="closeScreen"
  >
    <span v-html="item.text"></span>
  </VPLink>
</template>

<style scoped>
.VPNavScreenMenuLink {
  display: block;
  border-bottom: 1px solid var(--vp-c-divider);
  padding: 12px 0 11px;
  line-height: 24px;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-1);
  transition:
    border-color 0.25s,
    color 0.25s;
}

.VPNavScreenMenuLink:hover {
  color: var(--vp-c-brand-1);
}
</style>
