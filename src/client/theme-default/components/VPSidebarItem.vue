<script setup lang="ts">
import type { DefaultTheme } from 'vitepress/theme'
import { computed } from 'vue'
import { useSidebarItemControl } from '../composables/sidebar'
import VPLink from './VPLink.vue'

const props = defineProps<{
  item: DefaultTheme.SidebarItem
  depth: number
}>()

const {
  collapsed,
  collapsible,
  isLink,
  isActiveLink,
  hasActiveLink,
  hasChildren
} = useSidebarItemControl(computed(() => props.item))

// Remove sectionTag - we'll use conditional rendering instead

const linkTag = computed(() => (isLink.value ? 'a' : 'div'))

const textTag = computed(() => {
  return !hasChildren.value
    ? 'p'
    : props.depth + 2 === 7
      ? 'p'
      : `h${props.depth + 2}`
})

const itemRole = computed(() => (isLink.value ? undefined : 'button'))

const classes = computed(() => [
  [`level-${props.depth}`],
  { collapsible: collapsible.value },
  { collapsed: collapsed.value },
  { 'is-link': isLink.value },
  { 'is-active': isActiveLink.value },
  { 'has-active': hasActiveLink.value }
])
</script>

<template>
  <!-- Items WITH children use details/summary -->
  <details v-if="hasChildren" class="VPSidebarItem" :class="classes" :open="!collapsed">
    <summary class="item" :role="itemRole">
      <div class="indicator" />

      <VPLink
        v-if="props.item.link"
        :tag="linkTag"
        class="link"
        :href="props.item.link"
        :rel="props.item.rel"
        :target="props.item.target"
      >
        <component :is="textTag" class="text" v-html="props.item.text" />
      </VPLink>
      <component v-else :is="textTag" class="text" v-html="props.item.text" />
      
      <!-- CSS-only caret icon -->
      <div class="caret">
        <span class="vpi-chevron-right caret-icon" />
      </div>
    </summary>

    <!-- Children items -->
    <div v-if="props.item.items && props.item.items.length" class="items">
      <template v-if="props.depth < 5">
        <VPSidebarItem
          v-for="i in props.item.items"
          :key="i.text"
          :item="i"
          :depth="props.depth + 1"
        />
      </template>
    </div>
  </details>

  <!-- Items WITHOUT children use div -->
  <div v-else class="VPSidebarItem" :class="classes">
    <div class="item" :role="itemRole">
      <div class="indicator" />

      <VPLink
        v-if="props.item.link"
        :tag="linkTag"
        class="link"
        :href="props.item.link"
        :rel="props.item.rel"
        :target="props.item.target"
      >
        <component :is="textTag" class="text" v-html="props.item.text" />
      </VPLink>
      <component v-else :is="textTag" class="text" v-html="props.item.text" />
    </div>
  </div>
</template>

<style scoped>
.VPSidebarItem.level-0 {
  padding-bottom: 24px;
}

.VPSidebarItem.collapsed.level-0,
.VPSidebarItem.level-0:not([open]) {
  padding-bottom: 10px;
}

.item {
  position: relative;
  display: flex;
  width: 100%;
}

.VPSidebarItem.collapsible > .item {
  cursor: pointer;
}

.VPSidebarItem details > summary.item {
  cursor: pointer;
}

.indicator {
  position: absolute;
  top: 6px;
  bottom: 6px;
  left: -17px;
  width: 2px;
  border-radius: 2px;
  transition: background-color 0.25s;
}

.VPSidebarItem.level-2.is-active > .item > .indicator,
.VPSidebarItem.level-3.is-active > .item > .indicator,
.VPSidebarItem.level-4.is-active > .item > .indicator,
.VPSidebarItem.level-5.is-active > .item > .indicator {
  background-color: var(--vp-c-brand-1);
}

.link {
  display: flex;
  align-items: center;
  flex-grow: 1;
}

.text {
  flex-grow: 1;
  padding: 4px 0;
  line-height: 24px;
  font-size: 14px;
  transition: color 0.25s;
}

.VPSidebarItem.level-0 .text {
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.VPSidebarItem.level-1 .text,
.VPSidebarItem.level-2 .text,
.VPSidebarItem.level-3 .text,
.VPSidebarItem.level-4 .text,
.VPSidebarItem.level-5 .text {
  font-weight: 500;
  color: var(--vp-c-text-2);
}

.VPSidebarItem.level-0.is-link > .item > .link:hover .text,
.VPSidebarItem.level-1.is-link > .item > .link:hover .text,
.VPSidebarItem.level-2.is-link > .item > .link:hover .text,
.VPSidebarItem.level-3.is-link > .item > .link:hover .text,
.VPSidebarItem.level-4.is-link > .item > .link:hover .text,
.VPSidebarItem.level-5.is-link > .item > .link:hover .text {
  color: var(--vp-c-brand-1);
}

.VPSidebarItem.level-0.has-active > .item > .text,
.VPSidebarItem.level-1.has-active > .item > .text,
.VPSidebarItem.level-2.has-active > .item > .text,
.VPSidebarItem.level-3.has-active > .item > .text,
.VPSidebarItem.level-4.has-active > .item > .text,
.VPSidebarItem.level-5.has-active > .item > .text,
.VPSidebarItem.level-0.has-active > .item > .link > .text,
.VPSidebarItem.level-1.has-active > .item > .link > .text,
.VPSidebarItem.level-2.has-active > .item > .link > .text,
.VPSidebarItem.level-3.has-active > .item > .link > .text,
.VPSidebarItem.level-4.has-active > .item > .link > .text,
.VPSidebarItem.level-5.has-active > .item > .link > .text {
  color: var(--vp-c-text-1);
}

.VPSidebarItem.level-0.is-active > .item .link > .text,
.VPSidebarItem.level-1.is-active > .item .link > .text,
.VPSidebarItem.level-2.is-active > .item .link > .text,
.VPSidebarItem.level-3.is-active > .item .link > .text,
.VPSidebarItem.level-4.is-active > .item .link > .text,
.VPSidebarItem.level-5.is-active > .item .link > .text {
  color: var(--vp-c-brand-1);
}

/* CSS-only icon caret for collapsible items */
.caret {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: -7px;
  width: 32px;
  height: 32px;
  color: var(--vp-c-text-3);
  transition: color 0.25s;
  flex-shrink: 0;
}

.item:hover .caret {
  color: var(--vp-c-text-2);
}

.caret-icon {
  font-size: 18px;
  /*rtl:ignore*/
  transform: rotate(90deg);
  transition: transform 0.25s;
}

/* Rotate icon when details is open */
.VPSidebarItem details[open] .caret-icon {
  transform: rotate(0deg)/*rtl:rotate(0deg)*/;
}

/* Remove old triangle styles */
.VPSidebarItem details > summary.item {
  cursor: pointer;
}

/* Remove padding-right since we're using icon now */
.VPSidebarItem details > summary.item h2,
.VPSidebarItem details > summary.item h3,
.VPSidebarItem details > summary.item h4,
.VPSidebarItem details > summary.item h5,
.VPSidebarItem details > summary.item h6,
.VPSidebarItem details > summary.item p {
  margin: 0;
}

/* Hide native details marker */
.VPSidebarItem details > summary {
  list-style: none;
}

.VPSidebarItem details > summary::-webkit-details-marker {
  display: none;
}

/* Show items only when details is open */
.VPSidebarItem details[open] .items {
  display: block;
}

.VPSidebarItem details:not([open]) .items {
  display: none;
}

.VPSidebarItem.level-1 .items,
.VPSidebarItem.level-2 .items,
.VPSidebarItem.level-3 .items,
.VPSidebarItem.level-4 .items,
.VPSidebarItem.level-5 .items {
  border-left: 1px solid var(--vp-c-divider);
  padding-left: 16px;
}
</style>
