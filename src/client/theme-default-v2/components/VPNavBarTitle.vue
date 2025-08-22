<script setup lang="ts">
import { computed } from 'vue'
import { useData } from '../composables/data'
import { useLangs } from '../composables/langs'
import { normalizeLink } from '../support/utils'
import VPImage from './VPImage.vue'

const { site, theme } = useData()
const { currentLang } = useLangs()

const link = computed(() =>
  typeof theme.value.logoLink === 'string'
    ? theme.value.logoLink
    : theme.value.logoLink?.link
)

const rel = computed(() =>
  typeof theme.value.logoLink === 'string'
    ? undefined
    : theme.value.logoLink?.rel
)

const target = computed(() =>
  typeof theme.value.logoLink === 'string'
    ? undefined
    : theme.value.logoLink?.target
)
</script>

<template>
  <div class="vp-nav-bar-title">
    <a
      class="vp-nav-bar-title__link"
      :href="link ?? normalizeLink(currentLang.link)"
      :rel
      :target
    >
      <slot name="nav-bar-title-before" />
      <VPImage v-if="theme.logo" class="vp-nav-bar-title__logo" :image="theme.logo" />
      <span v-if="theme.siteTitle" class="vp-nav-bar-title__name" v-html="theme.siteTitle"></span>
      <span v-else-if="theme.siteTitle === undefined" class="vp-nav-bar-title__name">{{ site.title }}</span>
      <slot name="nav-bar-title-after" />
    </a>
  </div>
</template>

<style>
.vp-nav-bar-title__link {
  display: flex;
  align-items: center;
  width: 100%;
  height: var(--vp-nav-height);
  font-size: 16px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  transition: opacity 0.25s;

  &:hover {
    opacity: 0.6;
  }

  @media (min-width: 960px) {
    flex-shrink: 0;
  }
}

.vp-nav-bar-title__logo {
  height: var(--vp-nav-logo-height);
}

.vp-nav-bar-title__logo + .vp-nav-bar-title__name {
  margin-left: 4px;
}
</style>
