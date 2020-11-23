<template>
  <nav v-if="navData || repoInfo" class="navbar-links">
    <template v-if="navData">
      <template v-for="item of navData">
        <NavDropdownLink v-if="item.items" :item="item" />
        <NavBarLink v-else :item="item" />
      </template>
    </template>
    <NavDropdownLink v-if="localeCandidates" :item="localeCandidates" />
    <NavBarLink v-if="repoInfo" :item="repoInfo" />
  </nav>
</template>

<script src="./NavBarLinks"></script>

<style scoped>
.navbar-links {
  padding: 1rem 0;
  border-bottom: 1px solid var(--c-divider);
}

@media (min-width: 720px) {
  .navbar-links {
    display: flex;
    align-items: center;
    border-bottom: 0;
  }
}
</style>
