<script setup lang="ts">
import { useData } from 'vitepress'

const { site, theme } = useData()
</script>

<template>
  <a class="VPNavBarTitle" href="/">
    <img v-if="theme.logo" class="logo" :src="theme.logo" :alt="site.title">
    {{ site.title }}
  </a>
</template>

<style scoped>
.VPNavBarTitle {
  display: flex;
  align-items: center;
  height: var(--vp-nav-height-mobile);
  font-size: 16px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  transition: background-color 0.5s, opacity 0.25s;
}

.VPNavBarTitle:hover {
  opacity: 0.6;
}

@media (min-width: 960px) {
  .VPNavBarTitle {
    flex-shrink: 0;
    margin-right: 32px;
    border-bottom: 1px solid var(--vp-c-divider-light);
    width: calc(var(--vp-sidebar-width) - 64px);
    height: var(--vp-nav-height-desktop);
    background-color: var(--vp-c-bg-sidebar);
  }
}

.logo {
  margin-right: 8px;
  height: 24px;
}
</style>
