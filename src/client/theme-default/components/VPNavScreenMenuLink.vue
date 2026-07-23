<script lang="ts" setup>
import { useRoute } from 'vitepress'
import type { DefaultTheme } from 'vitepress/theme'
import { computed, inject } from 'vue'
import { isActive } from '../../shared'
import { navInjectionKey } from '../composables/nav'
import VPLink from './VPLink.vue'

const props = defineProps<{
  item: DefaultTheme.NavItemWithLink
}>()

const route = useRoute()

const href = computed(() =>
  typeof props.item.link === 'function'
    ? props.item.link(route.data)
    : props.item.link
)

const isActiveLink = computed(() => {
  return isActive(
    route.data.relativePath,
    route.hash,
    props.item.activeMatch || href.value,
    !!props.item.activeMatch
  )
})

const { closeScreen } = inject(navInjectionKey)!
</script>

<template>
  <VPLink
    :class="{ VPNavScreenMenuLink: true, active: isActiveLink }"
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
  padding: 0.75rem 0 0.6875rem;
  line-height: 1.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--vp-c-text-1);
  transition:
    border-color 0.25s,
    color 0.25s;
}

.VPNavScreenMenuLink:hover {
  color: var(--vp-c-brand-1);
}

.VPNavScreenMenuLink.active {
  color: var(--vp-c-brand-1);
}
</style>
