<script lang="ts" setup>
import type { DefaultTheme } from 'vitepress/theme'
import { computed, inject, ref, watchEffect } from 'vue'
import { useData } from 'vitepress'
import { isActive } from '../support/utils.js'
import VPLink from './VPLink.vue'
import VPIconPlusSquare from './icons/VPIconPlusSquare.vue'
import VPIconMinusSquare from './icons/VPIconMinusSquare.vue'

const props = withDefaults(
  defineProps<{ item: DefaultTheme.SidebarItem; depth?: number }>(),
  { depth: 1 }
)

const { page, frontmatter } = useData()
const maxDepth = computed<number>(
  () => frontmatter.value.sidebarDepth || Infinity
)
const closeSideBar = inject('close-sidebar') as () => void

const collapsible = computed(() => 'items' in props.item ? !!props.item.collapsible : false)
const collapsed = ref(false)

/**
 * When this node is both a page and a parent node,
 * a split line will be added between the collapse button and the link to distinguish the functional area.
 */
const divider = computed(() => !!props.item.link && collapsible.value)


watchEffect(() => {
  if ('items' in props.item)
    collapsed.value = !!(collapsible.value && props.item.collapsed)
})

function toggle() {
  if (collapsible.value) {
    collapsed.value = !collapsed.value
  }
}

function clickLink() {
  // If there are no links to jump to, switch to expand when clicking on the text
  if (!props.item.link)
    toggle()
  else
    closeSideBar()
}
</script>

<template>
  <section class="VPSidebarLink" :class="{ collapsible, collapsed }">
    <div class="link-label">
      <VPLink
        class="link"
        :class="{ active: isActive(page.relativePath, item.link), divider }"
        :style="{ paddingLeft: 16 * (depth - 1) + 'px' }"
        :href="item.link"
        @click="clickLink"
      >
        <span v-html="item.text" class="link-text" :class="{ light: depth > 1 }"></span>
      </VPLink>

      <button class="action" @click.stop="toggle" type="button">
        <VPIconMinusSquare class="icon minus" />
        <VPIconPlusSquare class="icon plus" />
      </button>
    </div>
    <div class="items">
      <template
        v-if="'items' in item && depth < maxDepth"
        v-for="child in item.items"
        :key="child.link"
      >
        <VPSidebarLink :item="child" :depth="depth + 1" />
      </template>
    </div>
  </section>
</template>

<style scoped>
.link {
  flex: 1;
  display: block;
  margin: 4px 0;
  color: var(--vp-c-text-2);
  transition: color 0.5s;
}

.link:hover {
  color: var(--vp-c-text-1);
}

.link.active {
  color: var(--vp-c-brand);
}

.link :deep(.icon) {
  width: 12px;
  height: 12px;
  fill: currentColor;
}

.link-text {
  line-height: 20px;
  font-size: 14px;
  font-weight: 500;
}

.link-text.light {
  font-size: 13px;
  font-weight: 400;
}

.link-label {
  display: flex;
  align-items: center;
}

.link.divider {
  border-right: 1px solid var(--vp-c-divider-light);
}

.link:not(.divider):hover + .action {
  color: var(--vp-c-text-2);
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

.action:hover {
  color: var(--vp-c-text-2);
}

.VPSidebarLink.collapsible > .link-label .action {
  display: block;
}

.VPSidebarLink.collapsible > .link-label .link {
  cursor: pointer;
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

.VPSidebarLink.collapsed > .link-label .icon.minus { opacity: 0; }
.VPSidebarLink.collapsed > .link-label .icon.plus  { opacity: 1; }

.items {
  overflow: hidden;
}

.VPSidebarLink.collapsed .items {
  max-height: 0;
}
</style>
