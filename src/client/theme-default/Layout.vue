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

<style>
body {
  margin: 0;
}

* {
  box-sizing: border-box;
}

.theme {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial,
    sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
  --border-color: rgb(226, 232, 240);
  --header-height: 4rem;
  --sidebar-width: 18rem;
  --text-color: #2c3e50;
  --accent-color: #3eaf7c;
  color: var(--text-color);
}

header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--header-height);
  background-color: #fff;
  border-bottom: 1px solid var(--border-color);
  z-index: 4;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
}

aside {
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: var(--sidebar-width);
  padding-top: calc(var(--header-height) + 1.5rem);
  border-right: 1px solid var(--border-color);
  background-color: #fff;
  z-index: 3;
  overflow-y: auto;
}

main {
  margin-top: var(--header-height);
  margin-left: var(--sidebar-width);
}

a {
  text-decoration: none;
}
</style>
