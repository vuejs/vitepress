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
  <NavBarLinks class="hide-mobile"/>
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

@media screen and (max-width: 719px) {
  .hide-mobile {
    display: none;
  }
}
</style>
