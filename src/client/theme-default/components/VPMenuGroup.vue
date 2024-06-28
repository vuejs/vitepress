<script lang="ts" setup>
import { computed, ref } from 'vue';
import VPMenuLink from './VPMenuLink.vue'
import VPIconChevronRight from './icons/VPIconChevronRight.vue'

const props = defineProps<{
  text?: string
  collapsed?: Boolean
  items: any[]
}>()

const collapsed = ref(props.collapsed)

function onItemInteraction(e: MouseEvent | Event) {
  if ('key' in e && e.key !== 'Enter') {
    return
  }
  collapsed.value = !collapsed.value
}

const collapsible = computed(() => {
  return props.collapsed != null
})

const classes = computed(() => [
  { collapsible:  collapsible.value},
  { collapsed: collapsed.value },
])
</script>

<template>
  <div class="VPMenuGroup" :class="classes">
    <div
      v-if="collapsible && text"
      class="title"
      role="button"
      v-on="
        items
          ? { click: onItemInteraction, keydown: onItemInteraction }
          : {}
      "
      :tabindex="items && 0"
    >
      <p>{{ text }}</p>

      <div
        v-if="collapsed != null"
        class="caret"
        role="button"
        aria-label="toggle section"
        tabindex="0"
      >
        <VPIconChevronRight class="caret-icon" />
      </div>
    </div>

    <p v-else class="title">{{ text }}</p>
    

    <div v-for="item in items" class="VPMenuItems">
      <VPMenuLink v-if="'link' in item" :item="item" />
    </div>
  </div>
</template>

<style scoped>
.VPMenuGroup {
  margin: 12px -12px 0;
  border-top: 1px solid var(--vp-c-divider);
  padding: 12px 12px 0;
}

.VPMenuGroup:first-child {
  margin-top: 0;
  border-top: 0;
  padding-top: 0;
}

.VPMenuGroup + .VPMenuGroup {
  margin-top: 12px;
  border-top: 1px solid var(--vp-c-divider);
}

.title {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 12px;
  line-height: 32px;
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-text-2);
  white-space: nowrap;
  transition: color 0.25s;
}

.VPMenuGroup.collapsible .title{
  font-weight: 700;
  color: var(--vp-c-text-1);
  cursor: pointer;
}

.VPMenuGroup.collapsed .VPMenuItems {
  display: none;
}

.VPMenuGroup.collapsed .caret-icon {
  transform: rotate(0);
}

.caret-icon {
  width: 18px;
  height: 18px;
  fill: currentColor;
  transform: rotate(90deg);
  transition: transform 0.25s;
}
</style>
