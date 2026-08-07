<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import HomeHeroCopy from './HomeHeroCopy.vue'

const INSTALL_COMMAND = 'npx vitepress init'
</script>

<template>
  <DefaultTheme.Layout>
    <template #home-hero-actions-before-actions>
      <HomeHeroCopy :command="INSTALL_COMMAND" />
    </template>
  </DefaultTheme.Layout>
</template>
