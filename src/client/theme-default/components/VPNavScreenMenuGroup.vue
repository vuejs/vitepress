<script lang="ts" setup>
import { computed, ref } from 'vue'
import VPIconPlus from './icons/VPIconPlus.vue'
import VPNavScreenMenuGroupLink from './VPNavScreenMenuGroupLink.vue'
import VPNavScreenMenuGroupSection from './VPNavScreenMenuGroupSection.vue'

const props = defineProps<{
  text: string
  items: any[]
}>()

const isOpen = ref(false)

const groupId = computed(() =>
  `NavScreenGroup-${props.text.replace(' ', '-').toLowerCase()}`
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
      <span class="button-text">{{ text }}</span>
      <VPIconPlus class="button-icon" />
    </button>

    <div :id="groupId" class="items">
      <template v-for="item in items" :key="item.text">
        <div v-if="'link' in item" :key="item.text" class="item">
          <VPNavScreenMenuGroupLink
            :text="item.text"
            :link="item.link"
          />
        </div>

        <div v-else class="group">
          <VPNavScreenMenuGroupSection
            :text="item.text"
            :items="item.items"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.VPNavScreenMenuGroup {
  border-bottom: .0625rem solid var(--vp-c-divider-light);
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
  padding-bottom: .625rem;
  height: auto;
}

.VPNavScreenMenuGroup.open .button {
  padding-bottom: .375rem;
  color: var(--vp-c-brand);
}

.VPNavScreenMenuGroup.open .button-icon {
  transform: rotate(45deg);
}

.button {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: .75rem .25rem .6875rem 0;
  width: 100%;
  line-height: 1.5rem;
  font-size: .875rem;
  font-weight: 500;
  color: var(--vp-c-text-1);
  transition: color 0.25s;
}

.button:hover {
  color: var(--vp-c-brand);
}

.button-icon {
  width: .875rem;
  height: .875rem;
  fill: var(--vp-c-text-2);
  transition: fill 0.5s, transform 0.25s;
}

.group:first-child {
  padding-top: 0rem;
}

.group + .group,
.group + .item {
  padding-top: .25rem;
}
</style>
