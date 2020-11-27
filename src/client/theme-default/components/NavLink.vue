<template>
  <div class="nav-link">
    <a
      class="item"
      :class="classes"
      :href="href"
      :target="target"
      :rel="rel"
      :aria-label="ariaLabel"
    >
      {{ text }} <OutboundLink v-if="isExternal" />
    </a>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import { useNavLink } from '../composables/navLink'
import OutboundLink from './icons/OutboundLink.vue'

const { item } = defineProps<{
  item: DefaultTheme.NavItemWithLink
}>()

const {
  classes,
  isActive,
  isExternal,
  href,
  target,
  rel,
  ariaLabel,
  text
} = useNavLink(item)
</script>

<style scoped>
.nav-link {

}

.item {
  display: block;
  padding: 0 1.5rem;
  line-height: 36px;
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

.item.external:hover {
  border-bottom-color: transparent;
  color: var(--c-text);
}

@media (min-width: 720px) {
  .item {
    border-bottom: 2px solid transparent;
    padding: 0;
    line-height: 24px;
    font-size: .9rem;
    font-weight: 500;
  }

  .item:hover,
  .item.active {
    border-bottom-color: var(--c-brand);
    color: var(--c-text);
  }
}
</style>
