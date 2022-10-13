<script setup lang="ts">
import VPLink from './VPLink.vue'

defineProps<{
  icon?: string
  title: string
  details: string
  link?: string
}>()
</script>

<template>
  <component
    :is="link ? VPLink : 'article'"
    :href="link"
    class="VPFeature"
    :noIcon="!!link || undefined"
  >
    <div v-if="icon" class="icon">{{ icon }}</div>
    <h2 class="title">{{ title }}</h2>
    <p class="details">{{ details }}</p>
  </component>
</template>

<style scoped>
.VPFeature {
  border: 1px solid var(--vp-c-bg-soft);
  border-radius: 12px;
  padding: 24px;
  height: 100%;
  background-color: var(--vp-c-bg-soft);
}

.icon {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  border-radius: 6px;
  background-color: var(--vp-c-gray-light-4);
  width: 48px;
  height: 48px;
  font-size: 24px;
  transition: background-color 0.25s;
}

.dark .icon {
  background-color: var(--vp-c-gray-dark-5);
}

.title {
  line-height: 24px;
  font-size: 16px;
  font-weight: 600;
}

.details {
  padding-top: 8px;
  line-height: 24px;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-2);
}

.VPFeature.link {
  display: block;
  background-color: var(--vp-c-bg-soft);
  transition: border-color 0.25s, background-color 0.25s;
}

.VPFeature.link:hover {
  border-color: var(--vp-button-alt-hover-border);
  background-color: var(--vp-button-alt-hover-bg);
}

.VPFeature.link:hover .icon {
  background-color: var(--vp-c-gray-light-3);
}

.dark .VPFeature.link:hover .icon {
  background-color: var(--vp-c-gray-dark-3);
}

.VPFeature.link:active {
  border-color: var(--vp-button-alt-active-border);
  background-color: var(--vp-button-alt-active-bg);
  transition: border-color 0.1s, background-color 0.1s;
}

.VPFeature.link:active .icon {
  background-color: var(--vp-c-gray-light-2);
  transition: background-color 0.1s;
}

.dark .VPFeature.link:active .icon {
  background-color: var(--vp-c-gray-dark-4);
}
</style>
