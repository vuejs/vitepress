<template>
  <div class="page">
    <slot name="top" />

    <div class="content">
      <Content />
    </div>

    <PageFooter />

    <NextAndPrevLinks />

    <slot name="bottom" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import PageFooter from './PageFooter.vue'
import NextAndPrevLinks from './NextAndPrevLinks.vue'

export default defineComponent({
  components: {
    PageFooter,
    NextAndPrevLinks
  }
})
</script>

<style scoped>
.page {
  margin: 0 auto;
  padding: 0 1.5rem 4rem;
  max-width: 48rem;
}

.content {
  padding-bottom: 1.5rem;
}
</style>
