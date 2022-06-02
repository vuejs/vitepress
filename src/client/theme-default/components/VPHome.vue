<script setup lang="ts">
import VPHomeHero from './VPHomeHero.vue'
import VPHomeFeatures from './VPHomeFeatures.vue'
</script>

<template>
  <div class="VPHome">
    <slot name="home-hero-before" />
    <VPHomeHero />
    <slot name="home-hero-after" />

    <slot name="home-features-before" />
    <VPHomeFeatures />
    <slot name="home-features-after" />
  </div>
</template>

<style scoped>
.VPHome {
  padding-bottom: 6rem;
}

.VPHome :deep(.VPHomeSponsors) {
  margin-top: 7rem;
  margin-bottom: -8rem;
}

@media (min-width: 768px) {
  .VPHome {
    padding-bottom: 8rem;
  }
}
</style>
