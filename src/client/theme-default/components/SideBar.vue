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
  padding: 0;
  margin: 0;
}

.sidebar a {
  display: inline-block;
  color: var(--text-color);
  padding-left: 1.5rem;
}

.sidebar a:hover {
  color: var(--accent-color);
}

.sidebar a.active {
  color: var(--accent-color);
  font-weight: 500;
}

.sidebar > ul > li > a.active {
  padding-left: 1.25rem;
  border-left: .25rem solid var(--accent-color);
}

.sidebar ul ul {
  font-size: 0.9em;
  padding-left: 1rem;
}
</style>
