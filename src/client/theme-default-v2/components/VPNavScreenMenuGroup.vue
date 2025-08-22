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
  <div class="vp-nav-screen-menu-group" :class="{ 'vp-nav-screen-menu-group--is-open': isOpen }">
    <button
      class="vp-nav-screen-menu-group__button"
      :aria-controls="groupId"
      :aria-expanded="isOpen"
      @click="toggle"
    >
      <span class="vp-nav-screen-menu-group__button-text" v-html="text" />
      <span class="vp-nav-screen-menu-group__button-icon vpi-plus" />
    </button>

    <div :id="groupId" class="vp-nav-screen-menu-group__items">
      <template v-for="item in items" :key="JSON.stringify(item)">
        <div v-if="'link' in item" class="vp-nav-screen-menu-group__item">
          <VPNavScreenMenuGroupLink :item />
        </div>

        <div v-else-if="'component' in item" class="vp-nav-screen-menu-group__item">
          <component :is="item.component" v-bind="item.props" screen-menu />
        </div>

        <div v-else class="vp-nav-screen-menu-group__nest">
          <VPNavScreenMenuGroupSection :text="item.text" :items="item.items" />
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.vp-nav-screen-menu-group {
  border-bottom: 1px solid var(--vp-c-divider);
  height: 48px;
  overflow: hidden;
  transition: border-color 0.5s;

  &:first-child {
    padding-top: 0;
  }
}

.vp-nav-screen-menu-group--is-open {
  padding-bottom: 10px;
  height: auto;
}

.vp-nav-screen-menu-group--is-open {
  .vp-nav-screen-menu-group__button {
    padding-bottom: 4px;
    color: var(--vp-c-brand-1);
  }

  .vp-nav-screen-menu-group__button-icon {
    /*rtl:ignore*/
    transform: rotate(45deg);
  }

  .vp-nav-screen-menu-group__items {
    visibility: visible;
  }
}

.vp-nav-screen-menu-group__button {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 4px 11px 0;
  width: 100%;
  line-height: 24px;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-1);
  transition: color 0.25s;

  &:hover {
    color: var(--vp-c-brand-1);
  }
}

.vp-nav-screen-menu-group__button-icon {
  transition: transform 0.25s;
}

.vp-nav-screen-menu-group__nest + .vp-nav-screen-menu-group__nest,
.vp-nav-screen-menu-group__nest + .vp-nav-screen-menu-group__item {
  padding-top: 4px;
}
</style>
