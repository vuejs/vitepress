<template>
  <div class="navbar-link">
    <a
      class="item"
      :class="classes"
      :href="href"
      :target="target"
      :rel="rel"
      :aria-label="item.ariaLabel"
    >
      {{ item.text }} <OutboundLink v-if="isExternalLink" />
    </a>
  </div>
</template>

<script src="./NavBarLink"></script>

<style scoped>
.navbar-link {
  position: relative;
  padding: 0 1.5rem;
}

@media (min-width: 720px) {
  .navbar-link {
    padding: 0;
  }

  .navbar-link + .navbar-link,
  .dropdown-wrapper + .navbar-link {
    padding-left: 1.5rem;
  }
}

.item {
  display: block;
  margin-bottom: -2px;
  line-height: 40px;
  font-size: 1rem;
  font-weight: 600;
  color: var(--c-text);
  white-space: nowrap;
}

.item:hover,
.item.active {
  text-decoration: none;
  color: var(--c-brand);
}

@media (min-width: 720px) {
  .item {
    border-bottom: 2px solid transparent;
    line-height: 1.5rem;
    font-size: .9rem;
    font-weight: 500;
  }

  .item:hover,
  .item.active {
    color: var(--c-text);
    border-bottom-color: var(--c-brand);
  }

  .item.external:hover {
    border-bottom-color: transparent;
  }
}
</style>
