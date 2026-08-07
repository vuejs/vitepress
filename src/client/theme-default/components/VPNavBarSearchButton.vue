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
  gap: 8px;
  height: var(--vp-nav-height);
  padding: 8px 14px;
  font-size: 20px;
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

@media (min-width: 768px) {
  .VPNavBarSearchButton {
    height: auto;
    padding: 8px 12px;
    background-color: var(--vp-c-bg-alt);
    border-radius: 8px;
    font-size: 14px;
    line-height: 1;
    color: var(--vp-c-text-2);
  }

  .text {
    display: inline;
    font-size: 13px;
  }

  .keys {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 6px;
    border: 1px solid var(--vp-c-divider);
    border-radius: 4px;
    font-size: 12px;
  }
}
</style>
