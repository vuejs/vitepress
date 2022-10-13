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
}

.dark .icon {
  background-color: var(--vp-c-bg);
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
  border: 1px solid var(--vp-c-bg-soft);
  border-radius: 12px;
  padding: 24px;
  height: 100%;
  background-color: var(--vp-c-bg-soft);
}

.VPFeature.link:hover {
  border-color: var(--vp-button-alt-hover-border);
  color: var(--vp-button-alt-hover-text);
  background-color: var(--vp-button-alt-hover-bg);
  cursor: pointer;
}

.VPFeature.link:active {
  border-color: var(--vp-button-alt-active-border);
  color: var(--vp-button-alt-active-text);
  background-color: var(--vp-button-alt-active-bg);
}
</style>
