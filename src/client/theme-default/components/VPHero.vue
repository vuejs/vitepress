<script setup lang="ts">
import type { DefaultTheme } from 'vitepress/theme'
import { computed, inject } from 'vue'
import { layoutInfoInjectionKey } from '../composables/layout'
import VPButton from './VPButton.vue'
import VPImage from './VPImage.vue'

export interface HeroAction {
  theme?: 'brand' | 'alt'
  text: string
  link: string
  target?: string
  rel?: string
}

defineProps<{
  name?: string
  text?: string
  tagline?: string
  image?: DefaultTheme.ThemeableImage
  actions?: HeroAction[]
}>()

const { heroImageSlotExists } = inject(
  layoutInfoInjectionKey,
  { heroImageSlotExists: computed(() => false) }
)
</script>

<template>
  <div class="VPHero" :class="{ 'has-image': image || heroImageSlotExists }">
    <div class="container">
      <div class="main">
        <slot name="home-hero-info-before" />
        <slot name="home-hero-info">
          <h1 class="heading">
            <span v-if="name" v-html="name" class="name clip"></span>
            <span v-if="text" v-html="text" class="text"></span>
          </h1>
          <p v-if="tagline" v-html="tagline" class="tagline"></p>
        </slot>
        <slot name="home-hero-info-after" />

        <div v-if="actions" class="actions">
          <slot name="home-hero-actions-before-actions" />
          <div v-for="action in actions" :key="action.link" class="action">
            <VPButton
              tag="a"
              size="medium"
              :theme="action.theme"
              :text="action.text"
              :href="action.link"
              :target="action.target"
              :rel="action.rel"
            />
          </div>
        </div>
        <slot name="home-hero-actions-after" />
      </div>

      <div v-if="image || heroImageSlotExists" class="image">
        <div class="image-container">
          <div class="image-bg" />
          <slot name="home-hero-image">
            <VPImage v-if="image" class="image-src" :image />
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.VPHero {
  margin-top: calc((var(--vp-nav-height) + var(--vp-layout-top-height, 0px)) * -1);
  padding: calc(var(--vp-nav-height) + var(--vp-layout-top-height, 0px) + 3rem) 1.5rem 3rem;
}

@media (min-width: 40rem) {
  .VPHero {
    padding: calc(var(--vp-nav-height) + var(--vp-layout-top-height, 0px) + 5rem) 3rem 4rem;
  }
}

@media (min-width: 60rem) {
  .VPHero {
    padding: calc(var(--vp-nav-height) + var(--vp-layout-top-height, 0px) + 5rem) 4rem 4rem;
  }
}

.container {
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  max-width: 72rem;
}

@media (min-width: 60rem) {
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

@media (min-width: 60rem) {
  .VPHero.has-image .container {
    text-align: left;
  }
}

@media (min-width: 60rem) {
  .main {
    order: 1;
    width: calc((100% / 3) * 2);
  }

  .VPHero.has-image .main {
    max-width: 37rem;
  }
}

.heading {
  display: flex;
  flex-direction: column;
}

.name,
.text {
  width: fit-content;
  max-width: 24.5rem;
  letter-spacing: -0.025rem;
  line-height: 2.5rem;
  font-size: 2rem;
  font-weight: 700;
  white-space: pre-wrap;

  &:lang(ja) {
    font-feature-settings: 'palt';
    word-break: auto-phrase;
  }
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

@media (min-width: 40rem) {
  .name,
  .text {
    max-width: 36rem;
    line-height: 3.5rem;
    font-size: 3rem;
  }
}

@media (min-width: 60rem) {
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
  padding-top: 0.5rem;
  max-width: 24.5rem;
  line-height: 1.75rem;
  font-size: 1.125rem;
  font-weight: 500;
  white-space: pre-wrap;
  color: var(--vp-c-text-2);
}

.VPHero.has-image .tagline {
  margin: 0 auto;
}

@media (min-width: 40rem) {
  .tagline {
    padding-top: 0.75rem;
    max-width: 36rem;
    line-height: 2rem;
    font-size: 1.25rem;
  }
}

@media (min-width: 60rem) {
  .tagline {
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

@media (min-width: 40rem) {
  .actions {
    padding-top: 2rem;
  }
}

@media (min-width: 60rem) {
  .VPHero.has-image .actions {
    justify-content: flex-start;
  }
}

.action {
  flex-shrink: 0;
  padding: 0.375rem;
}

.image {
  order: 1;
  margin: -4.75rem -1.5rem -3rem;
}

@media (min-width: 40rem) {
  .image {
    margin: -6.75rem -1.5rem -3rem;
  }
}

@media (min-width: 60rem) {
  .image {
    flex-grow: 1;
    order: 2;
    margin: 0;
    min-height: 100%;
  }
}

.image-container {
  position: relative;
  margin: 0 auto;
  width: 20rem;
  height: 20rem;
}

@media (min-width: 40rem) {
  .image-container {
    width: 24.5rem;
    height: 24.5rem;
  }
}

@media (min-width: 60rem) {
  .image-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    /*rtl:ignore*/
    transform: translate(-2rem, -2rem);
  }
}

.image-bg {
  position: absolute;
  top: 50%;
  /*rtl:ignore*/
  left: 50%;
  border-radius: 50%;
  width: 12rem;
  height: 12rem;
  background-image: var(--vp-home-hero-image-background-image);
  filter: var(--vp-home-hero-image-filter);
  /*rtl:ignore*/
  transform: translate(-50%, -50%);
}

@media (min-width: 40rem) {
  .image-bg {
    width: 16rem;
    height: 16rem;
  }
}

@media (min-width: 60rem) {
  .image-bg {
    width: 20rem;
    height: 20rem;
  }
}

:deep(.image-src) {
  position: absolute;
  top: 50%;
  /*rtl:ignore*/
  left: 50%;
  max-width: 12rem;
  max-height: 12rem;
  width: 100%;
  height: 100%;
  object-fit: contain;
  /*rtl:ignore*/
  transform: translate(-50%, -50%);
}

@media (min-width: 40rem) {
  :deep(.image-src) {
    max-width: 16rem;
    max-height: 16rem;
  }
}

@media (min-width: 60rem) {
  :deep(.image-src) {
    max-width: 20rem;
    max-height: 20rem;
  }
}
</style>
