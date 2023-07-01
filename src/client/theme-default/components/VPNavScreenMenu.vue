<script lang="ts" setup>
import { useData } from '../composables/data'
import VPNavScreenMenuLink from './VPNavScreenMenuLink.vue'
import VPNavScreenMenuGroup from './VPNavScreenMenuGroup.vue'

const { theme } = useData()
</script>

<template>
  <nav v-if="theme.nav" class="VPNavScreenMenu">
    <template v-for="item in theme.nav" :key="item.text">
      <VPNavScreenMenuLink
        v-if="'link' in item"
        :item="item"
      />
      <VPNavScreenMenuGroup
        v-else
        :text="item.text || ''"
        :items="item.items"
      />
    </template>
  </nav>
</template>
