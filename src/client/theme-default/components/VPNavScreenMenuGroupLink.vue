<script lang="ts" setup>
import type { DefaultTheme } from 'vitepress/theme'
import { computed, inject } from 'vue'
import { useData } from '../composables/data'
import { isActive } from '../../shared'
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

const isActiveLink = computed(() =>
  isActive(
    page.value.relativePath,
    props.item.activeMatch || href.value,
    !!props.item.activeMatch
  )
)

const { closeScreen } = inject(navInjectionKey)!
</script>

<template>
  <VPLink
    :class="{ VPNavScreenMenuGroupLink: true, active: isActiveLink }"
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
.VPNavScreenMenuGroupLink {
  display: block;
  margin-left: 12px;
  line-height: 32px;
  font-size: 14px;
  font-weight: 400;
  color: var(--vp-c-text-1);
  transition: color 0.25s;
}

.VPNavScreenMenuGroupLink:hover {
  color: var(--vp-c-brand-1);
}

.VPNavScreenMenuGroupLink.active {
  color: var(--vp-c-brand-1);
}
</style>
