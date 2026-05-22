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
  padding: 8px 14px;
  font-size: 20px;
}

@media (min-width: 768px) {
  .VPNavBarAskAiButton {
    height: auto;
    padding: 11.5px;
    transition: color 0.3s ease;
    background-color: var(--vp-c-bg-alt);
    border-radius: 8px;
    font-size: 15px;
    color: var(--vp-c-text-2);
  }

  .VPNavBarAskAiButton:hover {
    color: var(--vp-c-brand-1);
  }
}
</style>
