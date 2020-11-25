<template>
  <div class="nav-item">
    <a
      class="nav-link"
      :class="classes"
      :href="href"
      :target="target"
      :rel="rel"
      :aria-label="item.ariaLabel"
    >
      {{ item.text }}
      <OutboundLink v-if="isExternalLink" />
    </a>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps } from 'vue'
import { useRoute } from 'vitepress'
import { withBase, isExternal } from '../utils'
import type { DefaultTheme } from '../config'
import OutboundLink from './icons/OutboundLink.vue'

const normalizePath = (path: string): string => {
  path = path
    .replace(/#.*$/, '')
    .replace(/\?.*$/, '')
    .replace(/\.html$/, '')
  if (path.endsWith('/')) {
    path += 'index'
  }
  return path
}

const { item } = defineProps<{
  item: DefaultTheme.NavItemWithLink
}>()

const route = useRoute()

const classes = computed(() => ({
  active: isActiveLink.value,
  external: isExternalLink.value
}))

const isActiveLink = computed(() => {
  return normalizePath(withBase(item.link)) === normalizePath(route.path)
})

const isExternalLink = computed(() => {
  return isExternal(item.link)
})

const href = computed(() => {
  return isExternalLink.value ? item.link : withBase(item.link)
})

const target = computed(() => {
  if (item.target) {
    return item.target
  }

  return isExternalLink.value ? '_blank' : ''
})

const rel = computed(() => {
  if (item.rel) {
    return item.rel
  }

  return isExternalLink.value ? 'noopener noreferrer' : ''
})
</script>

<style>
.nav-item {
  position: relative;
  display: inline-block;
  margin-left: 1.5rem;
  line-height: 2rem;
}

@media screen and (max-width: 719px) {
  .nav-item {
    display: block;
    margin-left: 0;
    padding: 0.3rem 1.5rem;
  }
}

.nav-link {
  display: block;
  margin-bottom: -2px;
  border-bottom: 2px solid transparent;
  font-size: 0.9rem;
  font-weight: 500;
  line-height: 1.4rem;
  color: var(--text-color);
  white-space: nowrap;
}

.nav-link:hover,
.nav-link.active {
  border-bottom-color: var(--accent-color);
  text-decoration: none;
}

.nav-link.external:hover {
  border-bottom-color: transparent;
}

@media screen and (max-width: 719px) {
  .nav-link {
    line-height: 1.7;
    font-size: 1em;
    font-weight: 600;
    border-bottom: none;
    margin-bottom: 0;
  }

  .nav-link:hover,
  .nav-link.active {
    color: var(--accent-color);
  }
}
</style>
