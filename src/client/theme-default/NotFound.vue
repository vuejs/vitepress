<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { withBase } from 'vitepress'
import { useData } from './composables/data'
import { useLangs } from './composables/langs'

const { site } = useData()
const { localeLinks } = useLangs({ removeCurrent: false })

const locale = ref({
  link: '/',
  index: 'root'
})

onMounted(() => {
  const path = window.location.pathname
    .replace(site.value.base, '')
    .replace(/(^.*?\/).*$/, '/$1')
  if (localeLinks.value.length) {
    locale.value =
      localeLinks.value.find(({ link }) => link.startsWith(path)) ||
      localeLinks.value[0]
  }
})

const notFound = computed(() => ({
  code: 404,
  title: 'PAGE NOT FOUND',
  quote:
    "But if you don't change your direction, and if you keep looking, you may end up where you are heading.",
  linkLabel: 'go to home',
  linkText: 'Take me home',
  ...(locale.value.index === 'root'
    ? site.value.themeConfig?.notFound
    : site.value.locales?.[locale.value.index]?.themeConfig?.notFound)
}))
</script>

<template>
  <div class="NotFound">
    <p class="code">{{ notFound.code }}</p>
    <h1 class="title">{{ notFound.title }}</h1>
    <div class="divider" />
    <blockquote class="quote">{{ notFound.quote }}</blockquote>

    <div class="action">
      <a
        class="link"
        :href="withBase(locale.link)"
        :aria-label="notFound.linkLabel"
      >
        {{ notFound.linkText }}
      </a>
    </div>
  </div>
</template>

<style scoped>
.NotFound {
  padding: 64px 24px 96px;
  text-align: center;
}

@media (min-width: 768px) {
  .NotFound {
    padding: 96px 32px 168px;
  }
}

.code {
  line-height: 64px;
  font-size: 64px;
  font-weight: 600;
}

.title {
  padding-top: 12px;
  letter-spacing: 2px;
  line-height: 20px;
  font-size: 20px;
  font-weight: 700;
}

.divider {
  margin: 24px auto 18px;
  width: 64px;
  height: 1px;
  background-color: var(--vp-c-divider);
}

.quote {
  margin: 0 auto;
  max-width: 256px;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-2);
}

.action {
  padding-top: 20px;
}

.link {
  display: inline-block;
  border: 1px solid var(--vp-c-brand-1);
  border-radius: 16px;
  padding: 3px 16px;
  font-size: 14px;
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
