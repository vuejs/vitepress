
<script setup lang="ts">
import { computed } from 'vue'
import { useData } from '../composables/data'
import { useEditLink } from '../composables/edit-link'
import VPHomeContent from './VPHomeContent.vue'
import VPHomeFeatures from './VPHomeFeatures.vue'
import VPHomeHero from './VPHomeHero.vue'
import VPLink from './VPLink.vue'

const { frontmatter, theme, page } = useData()
const editLink = useEditLink()

const hasEditLink = computed(
  () =>
    theme.value.editLink?.index &&
    page.value.filePath.endsWith('index.md') &&
    frontmatter.value.editLink !== false
)
</script>

<template>
  <div
    class="VPHome"
    :class="{ 'external-link-icon-enabled': theme.externalLinkIcon }"
  >
    <slot name="home-hero-before" />
    <VPHomeHero>
      <template #home-hero-info-before><slot name="home-hero-info-before" /></template>
      <template #home-hero-info><slot name="home-hero-info" /></template>
      <template #home-hero-info-after><slot name="home-hero-info-after" /></template>
      <template #home-hero-actions-after><slot name="home-hero-actions-after" /></template>
      <template #home-hero-actions-before-actions><slot name="home-hero-actions-before-actions" /></template>
      <template #home-hero-image><slot name="home-hero-image" /></template>
    </VPHomeHero>
    <slot name="home-hero-after" />

    <slot name="home-features-before" />
    <VPHomeFeatures />
    <slot name="home-features-after" />

    <VPHomeContent v-if="frontmatter.markdownStyles !== false">
      <Content />
    </VPHomeContent>
    <Content v-else />

    <div v-if="hasEditLink" class="edit-link">
      <VPLink class="edit-link-button" :href="editLink.url" :no-icon="true">
        <span class="vpi-square-pen edit-link-icon" />
        {{ editLink.text }}
      </VPLink>
    </div>
  </div>
</template>

<style scoped>
.VPHome {
  overflow-x: clip;
  margin-bottom: 6rem;
}

.edit-link {
  max-width: var(--vp-layout-max-width);
  margin: 0 auto;
  padding: 0 24px;
}

.edit-link-button {
  display: flex;
  align-items: center;
  border: 0;
  line-height: 2.2857143;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--vp-c-brand-1);
  transition: color 0.25s;
}

.edit-link-button:hover {
  color: var(--vp-c-brand-2);
}

.edit-link-icon {
  margin-inline-end: 0.5rem;
}

@media (min-width: 48rem) {
  .VPHome {
    margin-bottom: 8rem;
  }
}
</style>
