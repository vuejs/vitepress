<script lang="ts" setup generic="T extends DefaultTheme.NavItemWithLink">
import type { DefaultTheme } from 'vitepress/theme'
import { computed } from 'vue'
import { useData } from '../composables/data'
import { isActive } from '../../shared'
import VPLink from './VPLink.vue'

const props = defineProps<{
  item: T
}>()

const { page } = useData()

const href = computed(() =>
  typeof props.item.link === 'function'
    ? props.item.link(page.value)
    : props.item.link
)

defineOptions({ inheritAttrs: false })
</script>

<template>
  <div class="VPMenuLink">
    <VPLink
      v-bind="$attrs"
      :class="{
        active: isActive(
          page.relativePath,
          item.activeMatch || href,
          !!item.activeMatch
        )
      }"
      :href
      :target="item.target"
      :rel="item.rel"
      :no-icon="item.noIcon"
    >
      <span v-html="item.text"></span>
    </VPLink>
  </div>
</template>

<style scoped>
.VPMenuGroup + .VPMenuLink {
  margin: 12px -12px 0;
  border-top: 1px solid var(--vp-c-divider);
  padding: 12px 12px 0;
}

.link {
  display: block;
  border-radius: 6px;
  padding: 0 12px;
  line-height: 32px;
  font-size: 14px;
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
