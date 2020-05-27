<template>
  <div class="sidebar">
    <ul>
      <SideBarItem v-for="item of items" :item="item"></SideBarItem>
    </ul>
  </div>
</template>

<script src="./SideBar"></script>

<style>
.sidebar ul {
  list-style-type: none;
  line-height: 2;
  padding-left: 1.5rem;
  margin: 0;
  font-weight: 500;
}

.sidebar a {
  color: var(--text-color);
}

.sidebar a:hover {
  color: var(--accent-color);
}

.sidebar ul ul {
  font-weight: 400;
  font-size: 0.9em;
  padding-left: 1rem;
}
</style>
