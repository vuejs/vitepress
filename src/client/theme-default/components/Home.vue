<template>
  <HomeHero />
  <slot name="hero" />
  <HomeFeatures />
  <slot name="features" />
  <HomeFooter />
  <slot name="footer" />
</template>

<script setup lang="ts">
import HomeHero from './HomeHero.vue'
import HomeFeatures from './HomeFeatures.vue'
import HomeFooter from './HomeFooter.vue'
</script>
