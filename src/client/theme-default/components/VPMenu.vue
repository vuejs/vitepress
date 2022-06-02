<script lang="ts" setup>
import VPMenuLink from './VPMenuLink.vue'
import VPMenuGroup from './VPMenuGroup.vue'

defineProps<{
  items?: any[]
}>()
</script>

<template>
  <div class="VPMenu">
    <div v-if="items" class="items">
      <template v-for="item in items" :key="item.text">
        <VPMenuLink v-if="'link' in item" :item="item" />
        <VPMenuGroup v-else :text="item.text" :items="item.items" />
      </template>
    </div>

    <slot />
  </div>
</template>

<style scoped>
.VPMenu {
  border-radius: 12px;
  padding: .75rem;
  min-width: 8rem;
  border: .0625rem solid var(--vp-c-divider-light);
  background-color: var(--vp-c-bg);
  box-shadow: var(--vp-shadow-3);
  transition: background-color 0.5s;
}

.dark .VPMenu {
  box-shadow: var(--vp-shadow-2);
}

.VPMenu :deep(.group) {
  margin: 0 -0.75rem;
  padding: 0 .75rem .75rem;
}

.VPMenu :deep(.group + .group) {
  border-top: .0625rem solid var(--vp-c-divider-light);
  padding: .6875rem .75rem .75rem;
}

.VPMenu :deep(.group:last-child) {
  padding-bottom: 0;
}

.VPMenu :deep(.group + .item) {
  border-top: .0625rem solid var(--vp-c-divider-light);
  padding: .6875rem 1rem 0;
}

.VPMenu :deep(.item) {
  padding: 0 1rem;
  white-space: nowrap;
}

.VPMenu :deep(.label) {
  flex-grow: 1;
  line-height: 1.75rem;
  font-size: .75rem;
  font-weight: 500;
  color: var(--vp-c-text-2);
  transition: color .5s;
}

.VPMenu :deep(.action) {
  padding-left: 1.5rem;
}
</style>
