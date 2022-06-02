<script setup lang="ts">
import { useData } from 'vitepress'

const { site } = useData()
</script>

<template>
  <div class="NotFound">
    <p class="code">404</p>
    <h1 class="title">PAGE NOT FOUND</h1>
    <div class="divider" />
    <blockquote class="quote">
      But if you don't change your direction, and if you keep looking, you may end up where you are heading.
    </blockquote>

    <div class="action">
      <a class="link" :href="site.base" aria-label="go to home">
        Take me home
      </a>
    </div>
  </div>
</template>

<style scoped>
.NotFound {
  padding: 4rem 1.5rem 6rem;
  text-align: center;
}

@media (min-width: 768px) {
  .NotFound {
    padding: 6rem 2rem 10.5rem;
  }
}

.code {
  line-height: 4rem;
  font-size: 4rem;
  font-weight: 600;
}

.title {
  padding-top: .75rem;
  letter-spacing: .125rem;
  line-height: 1.25rem;
  font-size: 1.25rem;
  font-weight: 700;
}

.divider {
  margin: 1.5rem auto 1.125rem;
  width: 4rem;
  height: .0625rem;
  background-color: var(--vp-c-divider)
}

.quote {
  margin: 0 auto;
  max-width: 16rem;
  font-size: .875rem;
  font-weight: 500;
  color: var(--vp-c-text-2);
}

.action {
  padding-top: 1.25rem;
}

.link {
  display: inline-block;
  border: .0625rem solid var(--vp-c-brand);
  border-radius: 16px;
  padding: .1875rem 1rem;
  font-size: .875rem;
  font-weight: 500;
  color: var(--vp-c-brand);
  transition: border-color 0.25s, color .25s;
}

.link:hover {
  border-color: var(--vp-c-brand-dark);
  color: var(--vp-c-brand-dark);
}
</style>
