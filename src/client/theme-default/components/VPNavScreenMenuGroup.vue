<script lang="ts" setup>
import { computed, ref } from 'vue'
import VPNavScreenMenuGroupLink from './VPNavScreenMenuGroupLink.vue'
import VPNavScreenMenuGroupSection from './VPNavScreenMenuGroupSection.vue'

const props = defineProps<{
  text: string
  items: any[]
}>()

const isOpen = ref(false)

const groupId = computed(
  () => `NavScreenGroup-${props.text.replace(' ', '-').toLowerCase()}`
)

function toggle() {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <div class="VPNavScreenMenuGroup" :class="{ open: isOpen }">
    <button
      class="button"
      :aria-controls="groupId"
      :aria-expanded="isOpen"
      @click="toggle"
    >
      <span class="button-text" v-html="text"></span>
      <span class="vpi-plus button-icon" />
    </button>

    <ul :id="groupId" class="items">
      <li v-for="item in items" :key="JSON.stringify(item)">
        <div v-if="'link' in item" class="item">
          <VPNavScreenMenuGroupLink :item />
        </div>

        <div v-else-if="'component' in item" class="item">
          <component :is="item.component" v-bind="item.props" screen-menu />
        </div>

        <div v-else class="group">
          <VPNavScreenMenuGroupSection :text="item.text" :items="item.items" />
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.VPNavScreenMenuGroup {
  border-bottom: 1px solid var(--vp-c-divider);
  height: 3rem;
  overflow: hidden;
  transition: border-color 0.5s;
}

.VPNavScreenMenuGroup .items {
  visibility: hidden;
}

.VPNavScreenMenuGroup.open .items {
  visibility: visible;
}

.VPNavScreenMenuGroup.open {
  padding-bottom: 0.625rem;
  height: auto;
}

.VPNavScreenMenuGroup.open .button {
  padding-bottom: 0.375rem;
  color: var(--vp-c-brand-1);
}

.VPNavScreenMenuGroup.open .button-icon {
  /*rtl:ignore*/
  transform: rotate(45deg);
}

.button {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0.25rem 0.6875rem 0;
  width: 100%;
  line-height: 1.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--vp-c-text-1);
  transition: color 0.25s;
}

.button:hover {
  color: var(--vp-c-brand-1);
}

.button-icon {
  transition: transform 0.25s;
}

.group:first-child {
  padding-top: 0px;
}

.group + .group,
.group + .item {
  padding-top: 0.25rem;
}
</style>
