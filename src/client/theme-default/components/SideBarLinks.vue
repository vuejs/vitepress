<script setup lang="ts">
import { useSideBar } from '../composables/sideBar'
import { SideBarLink } from './SideBarLink'

const items = useSideBar()
</script>

<template>
  <ul v-if="items.length > 0" class="sidebar-links">
    <SideBarLink v-for="item of items" :item="item" />
  </ul>
</template>
