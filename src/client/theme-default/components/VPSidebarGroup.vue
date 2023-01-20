<script lang="ts" setup>
import { computed } from 'vue'
import type { DefaultTheme } from 'vitepress/theme'
import { useSidebarControl } from '../composables/sidebar.js'
import VPIconPlusSquare from './icons/VPIconPlusSquare.vue'
import VPIconMinusSquare from './icons/VPIconMinusSquare.vue'
import VPSidebarSection from './VPSidebarSection.vue'
import VPSidebarLink from './VPSidebarLink.vue'

const props = defineProps<{
  group: DefaultTheme.SidebarGroup
}>()

const { collapsed, toggle } = useSidebarControl(computed(() => props.group))

const classes = computed(() => ({
  collapsible: props.group.collapsible,
  collapsed: collapsed.value
}))
</script>

<template>
  <section class="VPSidebarGroup" :class="classes">
    <div
      v-if="group.text"
      class="title"
      :role="group.collapsible ? 'button' : undefined"
      @click="toggle"
    >
      <h2 class="title-text" v-html="group.text" />
      <div class="action">
        <VPIconMinusSquare class="icon minus" />
        <VPIconPlusSquare class="icon plus" />
      </div>
    </div>

    <div class="items">
      <template v-for="item in group.items">
        <VPSidebarSection v-if="'items' in item" :key="item.text" :item="item" />
        <VPSidebarLink v-else :key="item.link" :item="item" />
      </template>
    </div>
  </section>
</template>

<style scoped>
.title {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  z-index: 2;
}

.title-text {
  padding-top: 6px;
  padding-bottom: 6px;
  line-height: 20px;
  font-size: 14px;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.action {
  display: none;
  position: relative;
  margin-right: -8px;
  border-radius: 4px;
  width: 32px;
  height: 32px;
  color: var(--vp-c-text-3);
  transition: color 0.25s;
}

.VPSidebarGroup.collapsible .action {
  display: block;
}

.VPSidebarGroup.collapsible .title {
  cursor: pointer;
}

.title:hover .action {
  color: var(--vp-c-text-2);
}

.icon {
  position: absolute;
  top: 8px;
  left: 8px;
  width: 16px;
  height: 16px;
  fill: currentColor;
}

.icon.minus { opacity: 1; }
.icon.plus  { opacity: 0; }

.VPSidebarGroup.collapsed .icon.minus { opacity: 0; }
.VPSidebarGroup.collapsed .icon.plus  { opacity: 1; }

.items {
  overflow: hidden;
}

.VPSidebarGroup.collapsed .items {
  margin-bottom: -22px;
  max-height: 0;
}

@media (min-width: 960px) {
  .VPSidebarGroup.collapsed .items {
    margin-bottom: -14px;
  }
}
</style>
