<script lang="ts" setup>
defineProps<{
  text: string
}>()
</script>

<template>
  <button type="button" class="VPNavBarSearchButton">
    <span class="vpi-search" aria-hidden="true"></span>
    <span class="text">{{ text }}</span>
    <span class="keys" aria-hidden="true">
      <kbd class="key-cmd">&#x2318;</kbd>
      <kbd class="key-ctrl">Ctrl</kbd>
      <kbd>K</kbd>
    </span>
  </button>
</template>

<style scoped>
.VPNavBarSearchButton {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  height: var(--vp-nav-height);
  padding: 0.5rem 0.875rem;
  font-size: 1.25rem;
}

.text,
.keys,
:root.mac .key-ctrl,
:root:not(.mac) .key-cmd {
  display: none;
}

kbd {
  font-family: inherit;
  font-weight: 500;
}

@media (min-width: 48rem) {
  .VPNavBarSearchButton {
    height: auto;
    padding: 0.5rem 0.75rem;
    background-color: var(--vp-c-bg-alt);
    border-radius: 0.5rem;
    font-size: 0.875rem;
    line-height: 1;
    color: var(--vp-c-text-2);
  }

  .text {
    display: inline;
    font-size: 0.8125rem;
  }

  .keys {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.375rem;
    border: 1px solid var(--vp-c-divider);
    border-radius: 0.25rem;
    font-size: 0.75rem;
  }
}
</style>
