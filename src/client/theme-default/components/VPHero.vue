<script setup lang="ts">
import VPButton from './VPButton.vue'

export interface HeroAction {
  theme?: 'brand' | 'alt'
  text: string
  link: string
}

export interface Image {
  src: string
  alt?: string
}

defineProps<{
  name?: string
  text: string
  tagline?: string
  image?: Image
  actions?: HeroAction[]
}>()
</script>

<template>
  <div class="VPHero" :class="{ 'has-image': image }">
    <div class="container">
      <div class="main">
        <p v-if="name" class="name"><span class="clip">{{ name }}</span></p>
        <h1 v-if="text" class="text">{{ text }}</h1>
        <p v-if="tagline" class="tagline">{{ tagline }}</p>

        <div v-if="actions" class="actions">
          <div v-for="action in actions" :key="action.link" class="action">
            <VPButton
              tag="a"
              size="medium"
              :theme="action.theme"
              :text="action.text"
              :href="action.link"
            />
          </div>
        </div>
      </div>

      <div v-if="image" class="image">
        <div class="image-container">
          <div class="image-bg" />
          <img class="image-src" :src="image.src" :alt="image.alt">
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.VPHero {
  margin-top: calc(var(--vp-nav-height) * -1);
  padding: calc(var(--vp-nav-height) + 3rem) 1.5rem 3rem;
}

@media (min-width: 640px) {
  .VPHero {
    padding: calc(var(--vp-nav-height) + 5rem) 3rem 4rem;
  }
}

.container {
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  max-width: 60rem;
}

@media (min-width: 960px) {
  .container {
    flex-direction: row;
  }
}

.main {
  position: relative;
  z-index: 10;
  order: 2;
  flex-grow: 1;
  flex-shrink: 0;
}

.VPHero.has-image .container {
  text-align: center;
}

@media (min-width: 960px) {
  .VPHero.has-image .container {
    text-align: left;
  }
}

@media (min-width: 960px) {
  .main {
    order: 1;
  }
}

@media (min-width: 960px) {
  .main {
    width: 100%;
    max-width: calc((100% / 3) * 2);
  }
}

.name,
.text {
  max-width: 24.5rem;
  letter-spacing: -0.025rem;
  line-height: 2.5rem;
  font-size: 2rem;
  font-weight: 700;
}

.VPHero.has-image .name,
.VPHero.has-image .text {
  margin: 0 auto;
}

.name {
  color: var(--vp-home-hero-name-color);
}

.clip {
  background: var(--vp-home-hero-name-background);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: var(--vp-home-hero-name-color);
}

@media (min-width: 640px) {
  .name,
  .text {
    max-width: 36rem;
    line-height: 3.5rem;
    font-size: 3rem;
  }
}

@media (min-width: 960px) {
  .name,
  .text {
    line-height: 4rem;
    font-size: 3.5rem;
  }

  .VPHero.has-image .name,
  .VPHero.has-image .text {
    margin: 0;
  }
}

.tagline {
  padding-top: 1rem;
  max-width: 24.5rem;
  line-height: 1.75rem;
  font-size: 1.125rem;
  font-weight: 500;
  color: var(--vp-c-text-2);
}

.VPHero.has-image .tagline {
  margin: 0 auto;
}

@media (min-width: 640px) {
  .tagline {
    padding-top: 1.5rem;
    max-width: 36rem;
    line-height: 2rem;
    font-size: 1.25rem;
  }
}

@media (min-width: 960px) {
  .tagline {
    padding-top: 1.5rem;
    line-height: 2.25rem;
    font-size: 1.5rem;
  }

  .VPHero.has-image .tagline {
    margin: 0;
  }
}

.actions {
  display: flex;
  flex-wrap: wrap;
  margin: -0.375rem;
  padding-top: 1.5rem;
}

.VPHero.has-image .actions {
  justify-content: center;
}

@media (min-width: 640px) {
  .actions {
    padding-top: 2rem;
  }
}

@media (min-width: 960px) {
  .VPHero.has-image .actions {
    justify-content: flex-start;
  }
}

.action {
  flex-shrink: 0;
  padding: .375rem;
}

.image {
  order: 1;
  margin: -4.75rem -1.5rem -3rem;
}

@media (min-width: 640px) {
  .image {
    margin: -6.75rem -1.5rem -3rem;
  }
}

@media (min-width: 960px) {
  .image {
    order: 2;
    margin: 0;
    width: calc(100% / 3);
    min-height: 100%;
  }
}

.image-container {
  position: relative;
  margin: 0 auto;
  width: 20rem;
  height: 20rem;
}

@media (min-width: 640px) {
  .image-container {
    width: 24.5rem;
    height: 24.5rem;
  }
}

@media (min-width: 960px) {
  .image-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    transform: translate(-2rem, -2rem);
  }
}

.image-bg {
  position: absolute;
  top: 50%;
  left: 50%;
  border-radius: 50%;
  width: 12rem;
  height: 12rem;
  background-image: var(--vp-home-hero-image-background-image);
  filter: var(--vp-home-hero-image-filter);
  transform: translate(-50%, -50%);
}

@media (min-width: 640px) {
  .image-bg {
    width: 16rem;
    height: 16rem;
  }
}

@media (min-width: 960px) {
  .image-bg {
    width: 20rem;
    height: 20rem;
  }
}

.image-src {
  position: absolute;
  top: 50%;
  left: 50%;
  max-width: 12rem;
  transform: translate(-50%, -50%);
}

@media (min-width: 640px) {
  .image-src {
    max-width: 16rem;
  }
}

@media (min-width: 960px) {
  .image-src {
    max-width: 20rem;
  }
}
</style>
