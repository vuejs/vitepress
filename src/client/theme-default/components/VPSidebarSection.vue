<script setup lang="ts">
import type { DefaultTheme } from 'vitepress/theme'
import { computed } from 'vue'
import { useSidebarControl } from '../composables/sidebar.js'
import VPIconChevronRight from './icons/VPIconChevronRight.vue'
import VPSidebarLink from './VPSidebarLink.vue'

const props = defineProps<{
  item: DefaultTheme.SidebarSection
}>()

const { collapsed, hasActiveLink, toggle } = useSidebarControl(
  computed(() => props.item)
)

const classes = computed(() => ({
  collapsible: props.item.collapsible,
  collapsed: collapsed.value,
  active: hasActiveLink.value
}))
</script>

<template>
  <section class="VPSidebarSection" :class="classes">
    <h3
      class="title"
      :role="item.collapsible ? 'button' : undefined"
      @click="toggle"
    >
      {{ item.text }} <VPIconChevronRight v-if="item.collapsible" class="title-icon" />
    </h3>
    <div class="items">
      <VPSidebarLink
        v-for="link in item.items"
        :key="link.link"
        :item="link"
      />
    </div>
  </section>
</template>

<style scoped>
.title {
  padding: 4px 0;
  line-height: 24px;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-2);
  transition: color 0.25s;
}

.VPSidebarSection.collapsible .title {
  cursor: pointer;
}

.title:hover,
.VPSidebarSection.active .title {
  color: var(--vp-c-text-1);
}

.title-icon {
  display: inline-block;
  width: 16px;
  height: 16px;
  fill: currentColor;
  transform: translateY(3px) rotate(90deg);
  transform-origin: 50% 50%;
  transition: transform 0.25s;
}

.VPSidebarSection.collapsed .title-icon {
  transform: translateY(3px) rotate(0deg);
}

.items {
  margin-left: 3px;
  border-left: 1px solid var(--vp-c-divider);
  padding-left: 16px;
}

.VPSidebarSection.collapsed .items {
  display: none;
}
</style>
