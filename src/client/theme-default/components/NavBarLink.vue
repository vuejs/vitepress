<template>
  <a
    class="nav-link"
    :class="classes"
    :href="href"
    :target="target"
    :rel="rel"
    :aria-label="item.ariaLabel"
  >
    {{ item.text }}
    <OutboundLink v-if="isExternalLink" />
  </a>
</template>

<script src="./NavBarLink"></script>

<style>
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

.nav-link.external:hover {
  border-bottom: 0;
}
</style>
