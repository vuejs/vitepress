<template>
  <a
    class="title"
    :aria-label="$site.title + ', back to home'"
    :href="$site.base"
  >
    <img
      class="logo"
      v-if="$theme.logo"
      :src="withBase($theme.logo)"
      alt="logo"
    />
    <span>{{ $site.title }}</span>
  </a>
  <nav class="nav-links" v-if="navData">
    <template v-for="item of navData">
      <NavDropdownLink v-if='item.items' :item="item"/>
      <NavBarLink v-else :item="item"/>
    </template>
  </nav>
</template>

<script src="./NavBar"></script>

<style>
.title {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text-color);
}

.logo {
  margin-right: 0.75rem;
  height: 1.3rem;
  vertical-align: bottom;
}

.nav-links {
  display: flex;
  align-items: center;
  height: 35px;
  list-style-type: none;
  transform: translateY(1px);
}

@media screen and (max-width: 719px) {
  .nav-links {
    display: none;
  }
}
</style>
