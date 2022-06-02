<script setup lang="ts">
import VPHomeHero from './VPHomeHero.vue'
import VPHomeFeatures from './VPHomeFeatures.vue'
import { computed } from 'vue';
import { useData } from 'vitepress';

const { page } = useData()
const pageName = computed(() => {
  return page.value.relativePath.slice(0, page.value.relativePath.indexOf('/'))
})
</script>

<template>
  <div class="VPHome">
    <slot name="home-hero-before" />
    <VPHomeHero />
    <slot name="home-hero-after" />

    <slot name="home-features-before" />
    <VPHomeFeatures />
    <slot name="home-features-after" />

    <div class="content">
      <div class="content-container">
        <main class="main">
          <Content class="vp-doc" :class="pageName" />
        </main>
      </div>
    </div>
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
