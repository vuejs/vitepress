<script lang="ts" setup>
import { useData } from '../composables/data'
import VPNavBarMenuGroup from './VPNavBarMenuGroup.vue'
import VPNavBarMenuLink from './VPNavBarMenuLink.vue'

const { theme } = useData()
</script>

<template>
  <nav
    v-if="theme.nav"
    aria-labelledby="main-nav-aria-label"
    class="VPNavBarMenu"
  >
    <span id="main-nav-aria-label" class="visually-hidden">
      Main Navigation
    </span>
    <ul class="list">
      <li v-for="item in theme.nav" :key="JSON.stringify(item)">
        <VPNavBarMenuLink v-if="'link' in item" :item />
        <component
          v-else-if="'component' in item"
          :is="item.component"
          v-bind="item.props"
        />
        <VPNavBarMenuGroup v-else :item />
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.VPNavBarMenu {
  display: none;
}

.list {
  display: flex;
}

@media (min-width: 768px) {
  .VPNavBarMenu {
    display: block;
  }
}
</style>
