<template>
  <aside class="sidebar" :class="{ open }">
    <div class="nav">
      <NavBarLinks class="show-mobile" />
    </div>

    <slot name="sidebar-top" />

    <SideBarLinks />

    <slot name="sidebar-bottom" />
  </aside>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import NavBarLinks from './NavBarLinks.vue'
import SideBarLinks from './SideBarLinks.vue'

export default defineComponent({
  components: {
    NavBarLinks,
    SideBarLinks
  },

  props: {
    open: { type: Boolean, required: true }
  }
})
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: var(--header-height);
  bottom: 0;
  left: 0;
  z-index: var(--z-index-sidebar);
  border-right: 1px solid var(--c-divider);
  width: 16.4rem;
  background-color: var(--c-bg);
  overflow-y: auto;
  transform: translateX(-100%);
  transition: transform .25s ease;
}

@media (min-width: 720px) {
  .sidebar {
    transform: translateX(0);
  }
}

@media (min-width: 960px) {
  .sidebar {
    width: 20rem;
  }
}

.sidebar.open {
  transform: translateX(0);
}

.nav {
  display: block;
}

@media (min-width: 720px) {
  .nav {
    display: none;
  }
}
</style>
