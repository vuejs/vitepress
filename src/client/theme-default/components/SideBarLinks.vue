<template>
  <ul v-if="items.length > 0" class="sidebar-links">
    <SideBarLink
      v-for="item of items"
      :key="item.text"
      :item="item"
    />
  </ul>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useSideBar } from '../composables/sideBar'
import { SideBarLink } from './SideBarLink'

export default defineComponent({
  components: {
    SideBarLink
  },

  setup() {
    const items = useSideBar()

    return {
      items
    }
  }
})
</script>
