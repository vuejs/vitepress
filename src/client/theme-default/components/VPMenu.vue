<script lang="ts" setup generic="T extends DefaultTheme.NavItem">
import type { DefaultTheme } from 'vitepress/theme'
import VPMenuLink from './VPMenuLink.vue'
import VPMenuGroup from './VPMenuGroup.vue'

defineProps<{
  items?: T[]
}>()
</script>

<template>
  <div class="VPMenu">
    <div v-if="items" class="items">
      <template v-for="item in items" :key="JSON.stringify(item)">
        <VPMenuLink v-if="'link' in item" :item />
        <component
          v-else-if="'component' in item"
          :is="item.component"
          v-bind="item.props"
        />
        <VPMenuGroup v-else :text="item.text" :items="item.items" />
      </template>
    </div>

    <slot />
  </div>
</template>

<style scoped>
.VPMenu {
  border-radius: 0.75rem;
  padding: 0.75rem;
  min-width: 8rem;
  border: 1px solid var(--vp-c-divider);
  background-color: var(--vp-c-bg-elv);
  box-shadow: var(--vp-shadow-3);
  transition: background-color 0.5s;
  max-height: calc(100vh - var(--vp-nav-height));
  overflow-y: auto;
}

.VPMenu :deep(.group) {
  margin: 0 -0.75rem;
  padding: 0 0.75rem 0.75rem;
}

.VPMenu :deep(.group + .group) {
  border-top: 1px solid var(--vp-c-divider);
  padding: 0.6875rem 0.75rem 0.75rem;
}

.VPMenu :deep(.group:last-child) {
  padding-bottom: 0;
}

.VPMenu :deep(.group + .item) {
  border-top: 1px solid var(--vp-c-divider);
  padding: 0.6875rem 1rem 0;
}

.VPMenu :deep(.item) {
  padding: 0 1rem;
  white-space: nowrap;
}

.VPMenu :deep(.label) {
  flex-grow: 1;
  line-height: 1.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--vp-c-text-2);
  transition: color 0.5s;
}

.VPMenu :deep(.action) {
  padding-left: 1.5rem;
}
</style>
