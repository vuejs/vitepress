<template>
  <button type="button" class="VPNavBarAskAiButton">
    <span class="vpi-sparkles" aria-hidden="true"></span>
  </button>
</template>

<style scoped>
.VPNavBarAskAiButton {
  display: flex;
  align-items: center;
  height: var(--vp-nav-height);
  padding: 0.5rem 0.875rem;
  font-size: 1.25rem;
}

@media (min-width: 48rem) {
  .VPNavBarAskAiButton {
    height: auto;
    padding: 0.7188rem;
    transition: color 0.3s ease;
    background-color: var(--vp-c-bg-alt);
    border-radius: 0.5rem;
    font-size: 0.9375rem;
    color: var(--vp-c-text-2);
  }

  .VPNavBarAskAiButton:hover {
    color: var(--vp-c-brand-1);
  }
}
</style>
