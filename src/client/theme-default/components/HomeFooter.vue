<template>
  <footer v-if="footer" class="footer">
    <div class="container">
      <p class="text">{{ footer }}</p>
    </div>
  </footer>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useRoute } from 'vitepress'

export default defineComponent({
  setup() {
    const route = useRoute()

    const footer = computed(() => route.data.frontmatter.footer)

    return {
      footer
    }
  }
})
</script>

<style scoped>
.footer {
  margin: 0 auto;
  max-width: 960px;
}

@media (min-width: 720px) {
  .footer {
    padding: 0 1.5rem;
  }
}

.container {
  padding: 2rem 1.5rem 2.25rem;
}

.home-hero + .footer .container,
.home-features + .footer .container,
.home-content + .footer .container {
  border-top: 1px solid var(--c-divider);
}

@media (min-width: 420px) {
  .container {
    padding: 3rem 1.5rem 3.25rem;
  }
}

.text {
  margin: 0;
  text-align: center;
  line-height: 1.4;
  font-size: .9rem;
  color: var(--c-text-light);
}
</style>
