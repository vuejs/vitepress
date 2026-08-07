<script lang="ts" setup generic="T extends DefaultTheme.NavItemWithLink">
import { useRoute } from 'vitepress'
import type { DefaultTheme } from 'vitepress/theme'
import { computed } from 'vue'
import { isActive } from '../../shared'
import VPLink from './VPLink.vue'

const props = defineProps<{
  item: T
  rel?: string
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

defineOptions({ inheritAttrs: false })
</script>

<template>
  <div class="VPMenuLink">
    <VPLink
      v-bind="$attrs"
      :class="{ active: isActiveLink }"
      :href
      :target="item.target"
      :rel="props.rel ?? item.rel"
      :no-icon="item.noIcon"
    >
      <span v-html="item.text"></span>
    </VPLink>
  </div>
</template>

<style scoped>
.VPMenuGroup + .VPMenuLink {
  margin: 0.75rem -0.75rem 0;
  border-top: 1px solid var(--vp-c-divider);
  padding: 0.75rem 0.75rem 0;
}

.link {
  display: block;
  border-radius: 0.375rem;
  padding: 0 0.75rem;
  line-height: 2rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--vp-c-text-1);
  text-align: left;
  white-space: nowrap;
  transition:
    background-color 0.25s,
    color 0.25s;
}

.link:hover {
  color: var(--vp-c-brand-1);
  background-color: var(--vp-c-default-soft);
}

.link.active {
  color: var(--vp-c-brand-1);
}
</style>
