<script setup lang="ts">
import type { DefaultTheme } from 'vitepress/theme'
import VPImage from './VPImage.vue'
import VPLink from './VPLink.vue'

defineProps<{
  icon?: DefaultTheme.FeatureIcon
  title: string
  details?: string
  link?: string
  linkText?: string
  rel?: string
  target?: string
}>()
</script>

<template>
  <VPLink
    class="VPFeature"
    :href="link"
    :rel
    :target
    :no-icon="true"
    :tag="link ? 'a' : 'div'"
  >
    <article class="box">
      <div v-if="typeof icon === 'object' && icon.wrap" class="icon">
        <VPImage
          :image="icon"
          :alt="icon.alt"
          :height="icon.height || 48"
          :width="icon.width || 48"
        />
      </div>
      <VPImage
        v-else-if="typeof icon === 'object'"
        :image="icon"
        :alt="icon.alt"
        :height="icon.height || 48"
        :width="icon.width || 48"
      />
      <div v-else-if="icon" class="icon" v-html="icon"></div>
      <h2 class="title" v-html="title"></h2>
      <ul v-if="Array.isArray(details)" class="details">
        <li v-for="item in details" :key="item" v-html="item"></li>
      </ul>
      <p v-else-if="details" class="details" v-html="details"></p>
      <div v-if="linkText" class="link-text">
        <p class="link-text-value">
          {{ linkText }} <span class="vpi-arrow-right link-text-icon" />
        </p>
      </div>
    </article>
  </VPLink>
</template>

<style scoped>
.VPFeature {
  display: block;
  border: 1px solid var(--vp-c-bg-soft);
  border-radius: 0.75rem;
  height: 100%;
  background-color: var(--vp-c-bg-soft);
  transition: border-color 0.25s, background-color 0.25s;
}

.VPFeature.link:hover {
  border-color: var(--vp-c-brand-1);
}

.box {
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  height: 100%;
}

.box > :deep(.VPImage) {
  margin-bottom: 1.25rem;
}

.icon {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1.25rem;
  border-radius: 0.375rem;
  background-color: var(--vp-c-default-soft);
  width: 3rem;
  height: 3rem;
  font-size: 1.5rem;
  transition: background-color 0.25s;
}

.title {
  line-height: 1.5rem;
  font-size: 1rem;
  font-weight: 600;
}

.details {
  flex-grow: 1;
  padding-top: 0.5rem;
  line-height: 1.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--vp-c-text-2);
}

ul.details {
  list-style-type: disc;
  padding-left: 0.875rem;
}

.link-text {
  padding-top: 0.5rem;
}

.link-text-value {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--vp-c-brand-1);
}

.link-text-icon {
  margin-left: 0.375rem;
}
</style>
