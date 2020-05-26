<template>
  <div class="theme">
    <header>
      <NavBar />
    </header>
    <aside>
      <SideBar />
    </aside>
    <main>
      <Page />
    </main>
  </div>
  <Debug />
</template>

<script>
import NavBar from './components/NavBar.vue'
import SideBar from './components/Sidebar.vue'
import Page from './components/Page.vue'

export default {
  components: {
    NavBar,
    SideBar,
    Page
  }
}
</script>
