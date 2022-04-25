<script setup lang="ts">
import PageFooter from './PageFooter.vue'
import NextAndPrevLinks from './NextAndPrevLinks.vue'
</script>

<template>
  <main class="page">
    <div class="container">
      <slot name="top" />

      <Content class="content" />
      <PageFooter />
      <NextAndPrevLinks />

      <slot name="bottom" />
    </div>
  </main>
</template>

<style scoped>
.page {
  padding-top: var(--header-height);
}

@media (min-width: 720px) {
  .page {
    margin-left: 16.4rem;
  }
}

@media (min-width: 960px) {
  .page {
    margin-left: 20rem;
  }
}

@media print {
  .page {
    padding-top: 0;
  }
}

.container {
  margin: 0 auto;
  padding: 0 1.5rem 4rem;
  max-width: 48rem;
}

@media print {
  .container {
    padding-bottom: 0;
  }
}

.content {
  padding-bottom: 1.5rem;
}

@media (max-width: 420px) {
  .content {
    /* fix carbon ads display */
    clear: both;
  }
}

@media print {
  .content {
    padding-bottom: 0;
  }
}
</style>
