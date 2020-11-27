<template>
  <div class="nav-dropdown-link-item">
    <a
      class="item"
      :class="classes"
      :href="href"
      :target="target"
      :rel="rel"
      :aria-label="ariaLabel"
    >
      <span class="arrow" />
      <span class="text">{{ text }}</span>
      <span class="icon"><OutboundLink v-if="isExternal" /></span>
    </a>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import type { DefaultTheme } from '../config'
import { useNavLink } from '../composables/navLink'
import OutboundLink from './icons/OutboundLink.vue'

const { item } = defineProps<{
  item: DefaultTheme.NavItem
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
.item {
  display: block;
  padding: 0 1.5rem 0 2.5rem;
  line-height: 32px;
  font-size: .9rem;
  font-weight: 500;
  color: var(--c-text);
  white-space: nowrap;
}

@media (min-width: 720px) {
  .item {
    padding: 0 24px 0 12px;
    line-height: 32px;
    font-size: .85rem;
    font-weight: 500;
    color: var(--c-text);
    white-space: nowrap;
  }

  .item.active .arrow {
    opacity: 1;
  }
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
  .arrow {
    display: inline-block;
    margin-right: 8px;
    border-top: 6px solid #ccc;
    border-right: 4px solid transparent;
    border-bottom: 0;
    border-left: 4px solid transparent;
    vertical-align: middle;
    opacity: 0;
    transform: translateY(-2px) rotate(-90deg);
  }
}
</style>
