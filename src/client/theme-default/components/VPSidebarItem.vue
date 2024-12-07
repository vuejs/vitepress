<script setup lang="ts">
import type { DefaultTheme } from 'vitepress/theme'
import { computed } from 'vue'
import { useSidebarControl } from '../composables/sidebar'
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
  hasChildren,
  handleToggle,
} = useSidebarControl(computed(() => props.item))

const sectionTag = computed(() => (hasChildren.value ? 'section' : `div`))

const linkTag = computed(() => (isLink.value ? 'a' : 'div'))

const textTag = computed(() => {
  return !hasChildren.value
    ? 'p'
    : props.depth + 2 === 7
      ? 'p'
      : `h${props.depth + 2}`
})

const classes = computed(() => [
  [`level-${props.depth}`],
  { 'is-link': isLink.value },
  { 'is-active': isActiveLink.value },
  { 'has-active': hasActiveLink.value }
])

function onToggle(payload: ToggleEvent): void {
  handleToggle(payload.newState)
}
</script>

<template>
  <component :is="sectionTag" class="VPSidebarItem" :class="classes">
    <details
      v-if="item.text && collapsible && hasChildren"
      class="item"
      :open="!collapsed"
      @toggle="onToggle"
    >
      <summary>
        <div class="indicator" />
        
        <VPLink
          v-if="item.link"
          :tag="linkTag"
          class="link"
          :href="item.link"
          :rel="item.rel"
          :target="item.target"
        >
          <component :is="textTag" class="text" v-html="item.text" />
        </VPLink>
        <component v-else :is="textTag" class="text" v-html="item.text" />

        <div class="caret">
          <span class="vpi-chevron-right caret-icon" />
        </div>
      </summary>

      <div class="items">
        <template v-if="depth < 5">
          <VPSidebarItem
            v-for="i in item.items"
            :key="i.text"
            :item="i"
            :depth="depth + 1"
          />
        </template>
      </div>
    </details>
    <div
      v-else
      :is="item.text"
      class="item"
    >
      <div class="indicator" />

      <VPLink
        v-if="item.link"
        :tag="linkTag"
        class="link"
        :href="item.link"
        :rel="item.rel"
        :target="item.target"
      >
        <component :is="textTag" class="text" v-html="item.text" />
      </VPLink>
      <component v-else :is="textTag" class="text" v-html="item.text" />
    </div>

    <div v-if="(!collapsible || !item.text) && hasChildren" class="items">
      <template v-if="depth < 5">
        <VPSidebarItem
          v-for="i in item.items"
          :key="i.text"
          :item="i"
          :depth="depth + 1"
        />
      </template>
    </div>
  </component>
</template>

<style scoped>
.VPSidebarItem.level-0 {
  padding-bottom: 24px;
}

.VPSidebarItem.level-0:has(> details:not([open])) {
  padding-bottom: 10px;
}

.item {
  position: relative;
  display: flex;
  width: 100%;
}

.VPSidebarItem details summary {
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  position: relative;
}

.VPSidebarItem details summary .link {
  flex-grow: 0;
}

  
.VPSidebarItem details summary::-webkit-details-marker {
  display: none;
}

.VPSidebarItem details summary::marker {
  content: '';
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

.VPSidebarItem:is(.level-2, .level-3, .level-4, .level-5).is-active > .item > .indicator,
.VPSidebarItem:is(.level-2, .level-3, .level-4, .level-5).is-active > details > summary .indicator {
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

.VPSidebarItem:is(.level-1, .level-2, .level-3, .level-4, .level-5) .text {
  font-weight: 500;
  color: var(--vp-c-text-2);
}

.VPSidebarItem.is-active:is(.level-0, .level-1, .level-2, .level-3, .level-4, .level-5)  > .item > summary .text,
.VPSidebarItem.is-active:is(.level-0, .level-1, .level-2, .level-3, .level-4, .level-5)  > .item > .link > .text,
.VPSidebarItem:is(.level-0, .level-1, .level-2, .level-3, .level-4, .level-5) .link:hover >.text,
.VPSidebarItem:is(.level-0, .level-1, .level-2, .level-3, .level-4, .level-5) .link:focus >.text {
  color: var(--vp-c-brand-1);
}

.caret {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: -7px;
  width: 32px;
  height: 32px;
  color: var(--vp-c-text-3);
  cursor: pointer;
  transition: color 0.25s;
  flex-shrink: 0;
}

.item summary:hover .caret {
  color: var(--vp-c-text-1)
}

.caret-icon {
  font-size: 18px;
  transform: rotate(90deg);
  transition: transform 0.25s;
}

.VPSidebarItem > details:not([open]) > summary .caret-icon {
  transform: rotate(0);
}

.VPSidebarItem:is(.level-1, .level-2, .level-3, .level-4, .level-5) .items {
  border-left: 1px solid var(--vp-c-divider);
  padding-left: 16px;
}
</style>
