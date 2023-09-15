<script setup>
import icon from './documate.vue'
</script>

<template>
  <a class="ad-component" target="_blank" href="https://documate.site/">
    <icon class="icon"/>
    <span>Embed AI chat in your VitePress using your own content. Open-source.</span>
    <span class="cta">Try now →</span>
  </a>
</template>

<style scoped>
.ad-component {
  margin-bottom: 2rem;
  padding: .65rem 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  text-align: center;
  display: flex;
  align-items: center;
  text-decoration: none;
  color: var(--vp-c-text-2);
  transition: color 0.4s ease-in-out;
  font-size: 0.9rem;
}

.ad-component:hover {
  color: var(--vp-c-text-1);
}

.ad-component .icon {
  width: 1rem;
  height: 1rem;
  margin-right: 0.45rem;
}

.ad-component .cta {
  margin-left: 0.2rem;
  text-decoration: underline;
  text-underline-offset: 2px;
}
</style>
