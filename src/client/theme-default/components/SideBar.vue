<template>
  <NavBarLinks class="show-mobile" />

  <slot name="top" />

  <ul class="sidebar">
    <SideBarItem v-for="item of items" :item="item" />
  </ul>

  <slot name="bottom" />
</template>

<script setup lang="ts">
import { useRoute, useSiteDataByRoute } from 'vitepress'
import { computed } from 'vue'
import { getPathDirName } from '../utils'
import { useActiveSidebarLinks } from '../composables/activeSidebarLink'
import NavBarLinks from './NavBarLinks.vue'
import { SideBarItem } from './SideBarItem'
import type { DefaultTheme } from '../config'
import type { Header } from '../../../../types/shared'
import type { ResolvedSidebarItem } from './SideBarItem'

type ResolvedSidebar = ResolvedSidebarItem[]

const route = useRoute()
const siteData = useSiteDataByRoute()

useActiveSidebarLinks()

const items = computed(() => {
  const {
    headers,
    frontmatter: { sidebar, sidebarDepth = 2 }
  } = route.data

  if (sidebar === 'auto') {
    // auto, render headers of current page
    return resolveAutoSidebar(headers, sidebarDepth)
  } else if (Array.isArray(sidebar)) {
    // in-page array config
    return resolveArraySidebar(sidebar, sidebarDepth)
  } else if (sidebar === false) {
    return []
  } else {
    // no explicit page sidebar config
    // check global theme config
    const { sidebar: themeSidebar } = siteData.value.themeConfig
    if (themeSidebar === 'auto') {
      return resolveAutoSidebar(headers, sidebarDepth)
    } else if (Array.isArray(themeSidebar)) {
      return resolveArraySidebar(themeSidebar, sidebarDepth)
    } else if (themeSidebar === false) {
      return []
    } else if (typeof themeSidebar === 'object') {
      return resolveMultiSidebar(
        themeSidebar,
        route.path,
        headers,
        sidebarDepth
      )
    }
  }
})

function resolveAutoSidebar(headers: Header[], depth: number): ResolvedSidebar {
  const ret: ResolvedSidebar = []

  if (headers === undefined) {
    return []
  }

  let lastH2: ResolvedSidebarItem | undefined = undefined
  headers.forEach(({ level, title, slug }) => {
    if (level - 1 > depth) {
      return
    }

    const item: ResolvedSidebarItem = {
      text: title,
      link: `#${slug}`
    }
    if (level === 2) {
      lastH2 = item
      ret.push(item)
    } else if (lastH2) {
      ;(lastH2.children || (lastH2.children = [])).push(item)
    }
  })

  return ret
}

function resolveArraySidebar(
  config: DefaultTheme.SideBarItem[],
  depth: number
): ResolvedSidebar {
  return config
}

function resolveMultiSidebar(
  config: DefaultTheme.MultiSideBarConfig,
  path: string,
  headers: Header[],
  depth: number
): ResolvedSidebar {
  const paths = [path, Object.keys(config)[0]]
  const item = paths.map((x) => config[getPathDirName(x)]).find(Boolean)

  if (Array.isArray(item)) {
    return resolveArraySidebar(item, depth)
  }

  if (item === 'auto') {
    return resolveAutoSidebar(headers, depth)
  }

  return []
}
</script>

<style>
.show-mobile {
  display: none;
}

@media screen and (max-width: 719px) {
  .show-mobile {
    display: block;
  }
}

.sidebar,
.sidebar-items {
  list-style-type: none;
  line-height: 2;
  padding: 0;
  margin: 0;
}

.sidebar {
  padding: 1.5rem 0;
}

.sidebar-data {
  padding: 1.5rem 0;
}

@media screen and (max-width: 719px) {
  .sidebar-data {
    padding: 1rem;
  }
}

.sidebar-items .sidebar-items {
  padding-left: 1rem;
}

.sidebar-items .sidebar-items .sidebar-link {
  border-left: 0;
}

.sidebar-items .sidebar-items .sidebar-link.active {
  font-weight: 500;
}

.sidebar-items .sidebar-link {
  padding: 0.35rem 1rem 0.35rem 2rem;
  line-height: 1.4;
  font-size: 0.95em;
  font-weight: 400;
}

.sidebar-item + .sidebar-item {
  padding-top: 0.75rem;
}

.sidebar-items > .sidebar-item + .sidebar-item {
  padding-top: 0;
}

.sidebar-link {
  display: block;
  margin: 0;
  border-left: 0.25rem solid transparent;
  padding: 0.35rem 1.5rem 0.35rem 1.25rem;
  line-height: 1.7;
  font-size: 1.05em;
  font-weight: 700;
  color: var(--text-color);
}

a.sidebar-link:hover {
  text-decoration: none;
  color: var(--accent-color);
}

a.sidebar-link.active {
  border-left-color: var(--accent-color);
  font-weight: 600;
  color: var(--accent-color);
}
</style>
