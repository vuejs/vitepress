<template>
  <div class="navbar-link">
    <a
      class="item"
      :class="classes"
      :href="href"
      :target="target"
      :rel="rel"
      :aria-label="item.ariaLabel"
    >
      {{ item.text }} <OutboundLink v-if="isExternalLink" />
    </a>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps } from 'vue'
import { useRoute } from 'vitepress'
import { isExternal } from '../utils'
import type { DefaultTheme } from '../config'
import { useUrl } from '../composables/url'
import OutboundLink from './icons/OutboundLink.vue'

const { item } = defineProps<{
  item: DefaultTheme.NavItemWithLink
}>()

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

const { withBase } = useUrl()
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

<style scoped>
.navbar-link {
  position: relative;
  padding: 0 1.5rem;
}

@media (min-width: 720px) {
  .navbar-link {
    padding: 0;
  }

  .navbar-link + .navbar-link,
  .dropdown-wrapper + .navbar-link {
    padding-left: 1.5rem;
  }
}

.item {
  display: block;
  margin-bottom: -2px;
  line-height: 40px;
  font-size: 1rem;
  font-weight: 600;
  color: var(--c-text);
  white-space: nowrap;
}

.item:hover,
.item.active {
  text-decoration: none;
  color: var(--c-brand);
}

@media (min-width: 720px) {
  .item {
    border-bottom: 2px solid transparent;
    line-height: 1.5rem;
    font-size: .9rem;
    font-weight: 500;
  }

  .item:hover,
  .item.active {
    color: var(--c-text);
    border-bottom-color: var(--c-brand);
  }

  .item.external:hover {
    border-bottom-color: transparent;
  }
}
</style>
