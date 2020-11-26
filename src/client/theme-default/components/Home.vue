<template>
  <header class="hero">
    <img
      v-if="data.heroImage"
      :src="$withBase(heroImageSrc)"
      :alt="data.heroAlt || 'hero'"
    />

    <h1 v-if="data.heroText !== null" id="main-title">
      {{ data.heroText || siteTitle || 'Hello' }}
    </h1>

    <p v-if="data.tagline !== null" class="description">
      {{ data.tagline || siteDescription || 'Welcome to your VitePress site' }}
    </p>

    <p v-if="data.actionText && data.actionLink" class="action">
      <a class="action-link" :href="actionLink.link">
        {{ actionLink.text }}
      </a>
    </p>
    <slot name="hero" />
  </header>

  <div v-if="data.features && data.features.length" class="features">
    <div v-for="(feature, index) in data.features" :key="index" class="feature">
      <h2>{{ feature.title }}</h2>
      <p>{{ feature.details }}</p>
    </div>
    <slot name="features" />
  </div>

  <div v-if="data.footer" class="footer">
    {{ data.footer }}
    <slot name="footer" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useSiteData } from 'vitepress'

const route = useRoute()
const siteData = useSiteData()
const data = computed(() => route.data.frontmatter)
const actionLink = computed(() => ({
  link: data.value.actionLink,
  text: data.value.actionText
}))
const heroImageSrc = computed(() => data.value.heroImage)
const siteTitle = computed(() => siteData.value.title)
const siteDescription = computed(() => siteData.value.description)
</script>

<style scoped>
.hero {
  text-align: center;
}

.hero img {
  max-width: 100%;
  max-height: 280px;
  display: block;
  margin: 3rem auto 1.5rem;
}

.hero h1 {
  font-size: 3rem;
}

.hero h1,
.hero .description,
.hero .action {
  margin: 1.8rem auto;
}

.hero .description {
  max-width: 35rem;
  font-size: 1.6rem;
  line-height: 1.3;
  /* TODO: calculating lighten 40% color with using style :vars from `--c-text` */
  color: #6a8bad;
}

.action-link {
  display: inline-block;
  border-radius: 4px;
  padding: 0 20px;
  line-height: 48px;
  font-size: 1rem;
  font-weight: 500;
  color: #ffffff;
  background-color: var(--c-brand);
  transition: background-color .1s ease;
}

.action-link:hover {
  text-decoration: none;
  background-color: var(--c-brand-light);
}

@media (min-width: 420px) {
  .action-link {
    padding: 0 24px;
    line-height: 56px;
    font-size: 1.2rem;
    font-weight: 500;
  }
}

.features {
  border-top: 1px solid var(--c-divider);
  padding: 1.2rem 0;
  margin-top: 2.5rem;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  align-content: stretch;
  justify-content: space-between;
}

.feature {
  flex-grow: 1;
  flex-basis: 30%;
  max-width: 30%;
}

.feature h2 {
  font-size: 1.4rem;
  font-weight: 500;
  border-bottom: none;
  padding-bottom: 0;
  /* TODO: calculating lighten 10% color with using style :vars from `--c-text` */
  color: #3a5169;
}

.feature p {
  /* TODO: calculating lighten 25% color with using style :vars from `--c-text` */
  color: #4e6e8e;
}

.footer {
  padding: 2.5rem;
  border-top: 1px solid var(--c-divider);
  text-align: center;
  /* TODO: calculating lighten 25% color with using style :vars from `--c-text` */
  color: #4e6e8e;
}

@media screen and (max-width: 719px) {
  .features {
    flex-direction: column;
  }

  .feature {
    max-width: 100%;
    padding: 0 2.5rem;
  }
}

@media screen and (max-width: 429px) {
  .hero img {
    max-height: 210px;
    margin: 2rem auto 1.2rem;
  }

  .hero h1 {
    font-size: 2rem;
  }

  .hero h1,
  .hero .description {
    margin: 1.2rem auto;
  }

  .hero .description {
    font-size: 1.2rem;
  }

  .feature h2 {
    font-size: 1.25rem;
  }
}
</style>
