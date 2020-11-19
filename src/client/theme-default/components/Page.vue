<template>
  <div class="page">
    <slot name="top" />

    <div class="content">
      <Content />
    </div>

    <EditLink />
    <NextAndPrevLinks />

    <slot name="bottom" />
  </div>
</template>

<script setup lang="ts">
import EditLink from './EditLink.vue'
import NextAndPrevLinks from './NextAndPrevLinks.vue'
</script>

<style scoped>
.page {
  margin: 0 auto;
  padding: 0 1.5rem 4rem;
  max-width: 50rem;
}

.content {
  padding-bottom: 1.5rem;
}
</style>
