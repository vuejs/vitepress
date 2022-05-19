<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'

const { frontmatter: fm } = useData()
</script>

<template>
  <div v-if="fm.hero" class="VPHomeHero">
    <div class="container">
      <p v-if="fm.hero.name" class="name">{{ fm.hero.name }}</p>
      <h1 v-if="fm.hero.text" class="text">{{ fm.hero.text }}</h1>
      <p v-if="fm.hero.tagline" class="tagline">{{ fm.hero.tagline }}</p>
    </div>
  </div>
</template>

<style scoped>
.VPHomeHero {
  margin-top: calc(var(--vp-nav-height) * -1);
  padding: calc(var(--vp-nav-height) + 48px) 24px 56px;
}

@media (min-width: 640px) {
  .VPHomeHero {
    padding: calc(var(--vp-nav-height) + 80px) 48px 96px;
  }
}

@media (min-width: 960px) {
  .VPHomeHero {
    padding: calc(var(--vp-nav-height) + 80px) 32px 96px;
  }
}

.container {
  margin: 0 auto;
  max-width: 960px;
}

.name,
.text {
  line-height: 44px;
  font-size: 32px;
  font-weight: 700;
}

.name {
  padding-bottom: 4px;
  color: var(--vp-c-brand);
}

@media (min-width: 640px) {
  .name,
  .text {
    max-width: 920px;
    line-height: 56px;
    font-size: 48px;
    font-weight: 600;
  }

  .name {
    padding-bottom: 6px;
  }
}

@media (min-width: 960px) {
  .name,
  .text {
    max-width: 920px;
    line-height: 72px;
    font-size: 64px;
    font-weight: 600;
  }

  .name {
    padding-bottom: 6px;
  }
}

.tagline {
  padding-top: 16px;
  line-height: 32px;
  font-size: 18px;
  font-weight: 500;
  color: var(--vp-c-text-2);
}

@media (min-width: 640px) {
  .tagline {
    padding-top: 24px;
    max-width: 540px;
    line-height: 32px;
    font-size: 20px;
  }
}

@media (min-width: 960px) {
  .tagline {
    padding-top: 32px;
    max-width: 720px;
    line-height: 40px;
    font-size: 24px;
  }
}
</style>
