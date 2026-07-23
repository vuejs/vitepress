<script setup lang="ts">
import { withBase } from 'vitepress'
import { useData } from './composables/data'
import { useLangs } from './composables/langs'

const { theme } = useData()
const { currentLang } = useLangs()
</script>

<template>
  <div class="NotFound">
    <p class="code">{{ theme.notFound?.code ?? '404' }}</p>
    <h1 class="title">{{ theme.notFound?.title ?? 'PAGE NOT FOUND' }}</h1>
    <div class="divider" />
    <blockquote class="quote">
      {{
        theme.notFound?.quote ??
        "But if you don't change your direction, and if you keep looking, you may end up where you are heading."
      }}
    </blockquote>

    <div class="action">
      <a
        class="link"
        :href="withBase(theme.notFound?.link ?? currentLang.link)"
        :aria-label="theme.notFound?.linkLabel ?? 'go to home'"
      >
        {{ theme.notFound?.linkText ?? 'Take me home' }}
      </a>
    </div>
  </div>
</template>

<style scoped>
.NotFound {
  padding: 4rem 1.5rem 6rem;
  text-align: center;
}

@media (min-width: 48rem) {
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
  padding-top: 0.75rem;
  letter-spacing: 0.125rem;
  line-height: 1.25rem;
  font-size: 1.25rem;
  font-weight: 700;
}

.divider {
  margin: 1.5rem auto 1.125rem;
  width: 4rem;
  height: 1px;
  background-color: var(--vp-c-divider);
}

.quote {
  margin: 0 auto;
  max-width: 16rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--vp-c-text-2);
}

.action {
  padding-top: 1.25rem;
}

.link {
  display: inline-block;
  border: 1px solid var(--vp-c-brand-1);
  border-radius: 1rem;
  padding: 0.1875rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--vp-c-brand-1);
  transition:
    border-color 0.25s,
    color 0.25s;
}

.link:hover {
  border-color: var(--vp-c-brand-2);
  color: var(--vp-c-brand-2);
}
</style>
