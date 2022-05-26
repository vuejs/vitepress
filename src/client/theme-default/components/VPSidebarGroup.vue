<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { DefaultTheme } from '../config'
import VPSidebarLink from './VPSidebarLink.vue'

const props = defineProps<{
  text: string
  items: DefaultTheme.SidebarItem[]
  collapsible?: boolean
}>()

const collapsed = ref(false)
const itemsDiv = ref<HTMLDivElement | null>(null)
const height = ref('')

const storeHeight = () => {
  height.value = itemsDiv.value?.clientHeight + 'px'
}

const toggle = () => {
  if (!props.collapsible) return
  if (!collapsed.value) storeHeight()
  collapsed.value = !collapsed.value
}

onMounted(storeHeight)
</script>

<template>
  <section class="VPSidebarGroup">
    <div class="title" :class="{ collapsible }" @click="toggle">
      <h2 class="title-text">{{ text }}</h2>
      <svg
        v-if="collapsible"
        xmlns="http://www.w3.org/2000/svg"
        class="chevron"
        :class="{ collapsed }"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
          clip-rule="evenodd"
        />
      </svg>
    </div>

    <div class="items" :class="{ collapsed }" ref="itemsDiv">
      <template v-for="item in items" :key="item.link">
        <VPSidebarLink :item="item" />
      </template>
    </div>
  </section>
</template>

<style scoped>
.title {
  padding: 6px 0;
  display: flex;
  z-index: 2;
}

.title.collapsible {
  cursor: pointer;
}

.title-text {
  line-height: 20px;
  font-size: 14px;
  font-weight: 700;
  color: var(--vp-c-text-1);
  transition: color 0.5s;
}

.chevron {
  height: 20px;
  margin-left: 5px;
  transition: transform 0.5s;
}

.chevron.collapsed {
  transform: rotate(-90deg);
}

.items {
  height: v-bind('height');
  transition: height 0.5s;
  overflow: hidden;
}

.items.collapsed {
  height: 0;
  margin-bottom: -22px;
}

@media (min-width: 960px) {
  .items.collapsed {
    margin-bottom: -14px;
  }
}
</style>
