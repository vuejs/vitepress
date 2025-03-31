<script lang="ts" setup>
import { useData } from '../composables/data'
import VPNavBarMenuLink from './VPNavBarMenuLink.vue'
import VPNavBarMenuGroup from './VPNavBarMenuGroup.vue'
import { isClientOnly } from '../../shared'

const { theme } = useData()
</script>

<template>
  <ClientOnly :isClientOnly="isClientOnly(theme.nav)">
    <nav
      v-if="theme.nav"
      aria-labelledby="main-nav-aria-label"
      class="VPNavBarMenu"
    >
      <span id="main-nav-aria-label" class="visually-hidden">
        Main Navigation
      </span>
      <template v-for="item in theme.nav" :key="JSON.stringify(item)">
        <VPNavBarMenuLink v-if="'link' in item" :item="item" />
        <component
          v-else-if="'component' in item"
          :is="item.component"
          v-bind="item.props"
        />
        <VPNavBarMenuGroup v-else :item="item" />
      </template>
    </nav>
  </ClientOnly>
</template>

<style scoped>
.VPNavBarMenu {
  display: none;
}

@media (min-width: 768px) {
  .VPNavBarMenu {
    display: flex;
  }
}
</style>
