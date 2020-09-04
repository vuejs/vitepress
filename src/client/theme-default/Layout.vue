<template>
  <div class="theme">
    <header>
      <NavBar />
      <ToggleSideBarButton @toggle="toggleSidebar" />
    </header>
    <aside :class="{ open }">
      <SideBar/>
    </aside>
    <main>
      <Page />
    </main>
  </div>
  <Debug />
</template>

<script>
import { ref } from 'vue'

import NavBar from './components/NavBar.vue'
import ToggleSideBarButton from './components/ToggleSideBarButton.vue'
import SideBar from './components/SideBar.vue'
import Page from './components/Page.vue'

export default {
  components: {
    NavBar,
    ToggleSideBarButton,
    SideBar,
    Page
  },
  setup() {
    let open = ref(false)
    const toggleSidebar = () => {
      open.value = !open.value
    }
    return {
      open,
      toggleSidebar
    }
  }
}
</script>
