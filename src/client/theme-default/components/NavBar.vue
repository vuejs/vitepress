<template>
  <a
    class="site-title"
    :aria-label="$site.title + ', back to home'"
    :href="$site.base"
    >{{ $site.title }}</a
  >
  <ul class="nav-links">
    <li><a href="/hello/index">hello</a></li>
  </ul>
</template>

<style>
.site-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text-color);
}
</style>
