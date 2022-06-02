<script setup lang="ts">
defineProps<{
  icon?: string
  title: string
  details: string
}>()
</script>

<template>
  <article class="VPBox">
    <div v-if="icon" class="icon">{{ icon }}</div>
    <h1 class="title">{{ title }}</h1>
    <p class="details">{{ details }}</p>
  </article>
</template>

<style scoped>
.VPBox {
  border: .0625rem solid var(--vp-c-divider-light);
  border-radius: 12px;
  padding: 1.5rem;
  height: 100%;
  background-color: var(--vp-c-bg-soft);
}

.icon {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1.25rem;
  border-radius: 6px;
  background-color: var(--vp-c-gray-light-4);
  width: 3rem;
  height: 3rem;
  font-size: 1.5rem;
}

.dark .icon {
  background-color: var(--vp-c-bg);
}

.title {
  line-height: 1.5rem;
  font-size: 1rem;
  font-weight: 600;
}

.details {
  padding-top: .5rem;
  line-height: 1.5rem;
  font-size: .875rem;
  font-weight: 500;
  color: var(--vp-c-text-2);
}
</style>
