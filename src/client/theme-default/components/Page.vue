<template>
  <div class="content">
    <Content />
    <NextAndPrevLinks />
  </div>
</template>

<script>
import NextAndPrevLinks from './NextAndPrevLinks.vue'
export default {
  components:{ NextAndPrevLinks }
}
</script>

<style>
.content {
  max-width: 46rem;
  margin: 0px auto;
  padding: 1rem 2rem;
}

.content a {
  color: var(--accent-color);
}

.content a:hover {
  text-decoration: underline;
}

.content img {
  max-width: 100%;
}
/*
.content div > h1:first-child, .content div > h2:first-child {
  margin-top: 0;
} */
</style>
