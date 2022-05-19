<script setup lang="ts">
import VPButton from './VPButton.vue'

interface HeroAction {
  theme?: 'brand' | 'alt'
  text: string
  link: string
}

defineProps<{
  name?: string
  text: string
  tagline?: string
  actions?: HeroAction[]
}>()
</script>

<template>
  <div class="VPHero">
    <div class="container">
      <p v-if="name" class="name"><span class="clip">{{ name }}</span></p>
      <h1 v-if="text" class="text">{{ text }}</h1>
      <p v-if="tagline" class="tagline">{{ tagline }}</p>

      <div v-if="actions" class="actions">
        <div v-for="action in actions" :key="action.link" class="action">
          <VPButton
            tag="a"
            size="big"
            :theme="action.theme"
            :text="action.text"
            :href="action.link"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.VPHero {
  margin-top: calc(var(--vp-nav-height) * -1);
  padding: calc(var(--vp-nav-height) + 48px) 24px 48px;
}

@media (min-width: 640px) {
  .VPHero {
    padding: calc(var(--vp-nav-height) + 80px) 48px 64px;
  }
}

.container {
  margin: 0 auto;
  max-width: 960px;
}

.name,
.text {
  line-height: 40px;
  font-size: 32px;
  font-weight: 700;
}

.name {
  padding-bottom: 4px;
  color: var(--vp-home-hero-name-color);
}

.clip {
  background: var(--vp-home-hero-name-background);
  -webkit-text-fill-color: var(--vp-home-hero-name-color);
  -webkit-background-clip: text;
}

@media (min-width: 640px) {
  .name,
  .text {
    max-width: 640px;
    line-height: 56px;
    font-size: 48px;
  }

  .name {
    padding-bottom: 6px;
  }
}

@media (min-width: 960px) {
  .name,
  .text {
    max-width: 720px;
    line-height: 64px;
    font-size: 56px;
  }

  .name {
    padding-bottom: 6px;
  }
}

.tagline {
  padding-top: 16px;
  line-height: 28px;
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
    padding-top: 24px;
    max-width: 640px;
    line-height: 36px;
    font-size: 24px;
  }
}

.actions {
  display: flex;
  flex-wrap: wrap;
  margin: -8px;
  padding-top: 24px;
}

@media (min-width: 640px) {
  .actions {
    padding-top: 32px;
  }
}

.action {
  flex-shrink: 0;
  padding: 8px;
}
</style>
