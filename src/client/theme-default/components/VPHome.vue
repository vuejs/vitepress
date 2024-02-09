<script setup lang="ts">
import VPHomeHero from './VPHomeHero.vue'
import VPHomeFeatures from './VPHomeFeatures.vue'
import VPHomeContent from './VPHomeContent.vue'
import { useData } from './composables/data'

const { frontmatter } = useData()
</script>

<template>
  <div class="VPHome">
    <slot name="home-hero-before" />
    <VPHomeHero>
      <template #home-hero-info-before><slot name="home-hero-info-before" /></template>
      <template #home-hero-info><slot name="home-hero-info" /></template>
      <template #home-hero-info-after><slot name="home-hero-info-after" /></template>
      <template #home-hero-actions-after><slot name="home-hero-actions-after" /></template>
      <template #home-hero-image><slot name="home-hero-image" /></template>
    </VPHomeHero>
    <slot name="home-hero-after" />

    <slot name="home-features-before" />
    <VPHomeFeatures />
    <slot name="home-features-after" />

    <VPHomeContent v-if="frontmatter.homeDocs !== false">
      <Content />
    </VPHomeContent>
    <Content v-else />
  </div>
</template>

<style scoped>
.VPHome {
  padding-bottom: 96px;
}

.VPHome :deep(.VPHomeSponsors) {
  margin-top: 112px;
  margin-bottom: -128px;
}

@media (min-width: 768px) {
  .VPHome {
    padding-bottom: 128px;
  }
}
</style>
