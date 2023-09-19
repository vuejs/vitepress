<script lang="ts" setup>
import { useData } from '../composables/data'
import VPNavScreenMenuLink from './VPNavScreenMenuLink.vue'
import VPNavScreenMenuGroup from './VPNavScreenMenuGroup.vue'

const { theme } = useData()
</script>

<template>
  <nav v-if="theme.nav" class="VPNavScreenMenu">
    <template v-for="item in theme.nav" :key="item.text">
      <VPNavScreenMenuGroup
        v-if="item.items"
        :text="item.text || ''"
        :items="item.items"
      />
      <VPNavScreenMenuLink
        v-else
        :item="item"
      />
    </template>
  </nav>
</template>
