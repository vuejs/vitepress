<script setup lang="ts">
import { useData } from 'vitepress'
import { useSidebar } from '../composables/sidebar'

const { theme } = useData()
const { hasSidebar } = useSidebar()
</script>

<template>
  <footer v-if="theme.footer" class="VPFooter" :class="{ 'has-sidebar': hasSidebar }">
    <div class="container">
      <p class="message">{{ theme.footer.message }}</p>
      <p class="copyright">{{ theme.footer.copyright }}</p>
    </div>
  </footer>
</template>

<style scoped>
.VPFooter {
  position: relative;
  z-index: var(--vp-z-index-footer);
  border-top: .0625rem solid var(--vp-c-divider-light);
  padding: 2rem 1.5rem;
  background-color: var(--vp-c-bg);
}

.VPFooter.has-sidebar {
  display: none;
}

@media (min-width: 768px) {
  .VPFooter {
    padding: 2rem;
  }
}

.container {
  margin: 0 auto;
  max-width: var(--vp-layout-max-width);
  text-align: center;
}

.message,
.copyright {
  line-height: 1.5rem;
  font-size: .875rem;
  font-weight: 500;
  color: var(--vp-c-text-2);
}

.message   { order: 2; }
.copyright { order: 1; }
</style>
