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
    <a
      class="nav-link"
      v-for="{ text, link, target, rel, ariaLabel } of navData"
      :class="{ active: isActiveLink(link) }"
      :href="withBase(link)"
      :target="target"
      :rel="rel"
      :aria-label="ariaLabel"
      >{{ text }}</a
    >
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
  list-style-type: none;
}

.nav-link {
  color: var(--text-color);
  margin-left: 1.5rem;
  font-weight: 600;
  display: inline-block;
  height: 1.75rem;
  line-height: 1.75rem;
}

.nav-link:hover,
.nav-link.active {
  border-bottom: 2px solid var(--accent-color);
}
</style>
