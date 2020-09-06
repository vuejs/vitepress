<template>
  <NavBarLinks class="show-mobile"/>
  <ul class="sidebar">
    <SideBarItem v-for="item of items" :item="item" />
  </ul>
</template>

<script src="./SideBar"></script>

<style>
.show-mobile {
  display: none;
}
@media screen and (max-width: 719px) {
  .show-mobile {
    display: block;
  }
}

.sidebar,
.sidebar-items {
  list-style-type: none;
  line-height: 2;
  padding: 0;
  margin: 0;
}

.sidebar-items .sidebar-items {
  padding-left: 1rem;
}

.sidebar-items .sidebar-items .sidebar-link {
  border-left: 0;
}

.sidebar-items .sidebar-items .sidebar-link.active {
  font-weight: 500;
}

.sidebar-items .sidebar-link {
  padding: .35rem 1rem .35rem 2rem;
  line-height: 1.4;
  font-size: 0.9em;
  font-weight: 400;
}

.sidebar-link {
  display: block;
  margin: 0;
  border-left: .25rem solid transparent;
  padding: .35rem 1.5rem .35rem 1.25rem;
  line-height: 1.7;
  font-size: 1em;
  font-weight: 600;
  color: var(--text-color);
}

a.sidebar-link {
  transition: color .15s ease;
}

a.sidebar-link:hover {
  color: var(--accent-color);
}

a.sidebar-link.active {
  border-left-color: var(--accent-color);
  font-weight: 600;
  color: var(--accent-color);
}
</style>
