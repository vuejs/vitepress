<script lang="ts" setup>
import { useData } from 'vitepress'
import { DefaultTheme } from '../config'
import VPSidebarLink from './VPSidebarLink.vue'

const props = defineProps<{
  text: string
  items: DefaultTheme.SidebarItem[]
}>()

const { page } = useData()
</script>

<template>
  <section class="VPSidebarGroup">
    <div class="title">
      <h2 class="title-text">{{ text }}</h2>
    </div>

    <template v-for="item in items" :key="item.link">
      <VPSidebarLink :item="item" />
    </template>
  </section>
</template>

<style scoped>
.title {
  padding: 6px 0;
}

.title-text {
  line-height: 20px;
  font-size: 14px;
  font-weight: 700;
  color: var(--vp-c-text-1);
  transition: color 0.5s;
}
</style>
