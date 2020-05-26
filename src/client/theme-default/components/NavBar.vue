<template>
  <a
    class="title"
    :aria-label="$site.title + ', back to home'"
    :href="$site.base"
  >
    <img
      class="logo"
      v-if="$theme.logo"
      :src="withBase($theme.logo)"
      alt="logo"
    />
    <span>{{ $site.title }}</span>
  </a>
  <nav class="nav-links" v-if="navData">
    <a
      class="nav-link"
      v-for="{ text, link, target, rel, ariaLabel } of navData"
      :class="{ active: isActiveLink(link) }"
      :href="withBase(link)"
      :target="target"
      :rel="rel"
      :aria-label="ariaLabel"
      >{{ text }}</a
    >
  </nav>
</template>

<script>
import { computed } from 'vue'
import { useSiteData, useRoute } from 'vitepress'
import { withBase } from '../utils'

const normalizePath = (path) => {
  path = path
    .replace(/#.*$/, '')
    .replace(/\?.*$/, '')
    .replace(/\.html$/, '')
  if (path.endsWith('/')) {
    path += 'index'
  }
  return path
}

export default {
  setup() {
    const route = useRoute()
    const isActiveLink = (link) => {
      return normalizePath(withBase(link)) === normalizePath(route.path)
    }

    return {
      withBase,
      isActiveLink,
      // use computed in dev for hot reload
      navData: __DEV__
        ? computed(() => useSiteData().value.themeConfig.nav)
        : useSiteData().value.themeConfig.nav
    }
  }
}
</script>

<style>
.title {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text-color);
}

.logo {
  margin-right: 0.75rem;
  height: 1.3rem;
  vertical-align: bottom;
}

.nav-links {
  list-style-type: none;
}

.nav-link {
  color: var(--text-color);
  margin-left: 1.5rem;
  font-weight: 500;
  display: inline-block;
  height: 1.75rem;
  line-height: 1.75rem;
}

.nav-link:hover,
.nav-link.active {
  border-bottom: 2px solid var(--accent-color);
}
</style>
