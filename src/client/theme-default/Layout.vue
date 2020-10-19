<template>
  <div class="theme">
    <header>
      <NavBar>
        <template #search>
          <slot name="navbar-search" />
        </template>
      </NavBar>
      <ToggleSideBarButton @toggle="toggleSidebar" />
    </header>
    <aside :class="{ open }">
      <SideBar>
        <template #top>
          <slot name="sidebar-top" />
        </template>
        <template #bottom>
          <slot name="sidebar-bottom" />
        </template>
      </SideBar>
    </aside>
    <!-- TODO: make this button accessible -->
    <div
      class="sidebar-mask"
      :class="{ 'sidebar-open': open }"
      @click="toggleSidebar(false)"
    />
    <main>
      <Page>
        <template #top>
          <slot name="page-top" />
        </template>
        <template #bottom>
          <slot name="page-bottom" />
        </template>
      </Page>
    </main>
  </div>
  <Debug />
</template>

<script>
import { ref, watch } from 'vue'
import NavBar from './components/NavBar.vue'
import ToggleSideBarButton from './components/ToggleSideBarButton.vue'
import SideBar from './components/SideBar.vue'
import Page from './components/Page.vue'
import { useRoute } from 'vitepress'

export default {
  components: {
    NavBar,
    ToggleSideBarButton,
    SideBar,
    Page
  },

  setup() {
    const open = ref(false)
    const route = useRoute()

    const toggleSidebar = (to) => {
      open.value = typeof to === 'boolean' ? to : !open.value
    }

    const hideSidebar = toggleSidebar.bind(null, false)
    // close the sidebar when navigating to a different location
    watch(route, hideSidebar)
    // TODO: route only changes when the pathname changes
    // listening to hashchange does nothing because it's prevented in router

    return { open, toggleSidebar }
  }
}
</script>
