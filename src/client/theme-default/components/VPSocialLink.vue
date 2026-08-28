<script lang="ts" setup>
import type { DefaultTheme } from 'vitepress/theme'
import { computed } from 'vue'

import { isExternal } from '../../shared'
import VPIcon from './VPIcon.vue'

const props = defineProps<{
  icon: DefaultTheme.SocialLinkIcon
  link: string
  ariaLabel?: string
  target?: string
  me: boolean
}>()

const qualifiedIcon = computed(() =>
  typeof props.icon === 'string' && !props.icon.includes(':')
    ? `simple-icons:${props.icon}`
    : props.icon
)
</script>

<template>
  <a
    class="VPSocialLink no-icon"
    :href="link"
    :aria-label="ariaLabel ?? (typeof icon === 'string' ? icon : '')"
    :target="target ?? (isExternal(link) ? '_blank' : undefined)"
    :rel="me ? 'me noopener' : 'noopener'"
  >
    <VPIcon :icon="qualifiedIcon" />
  </a>
</template>

<style scoped>
.VPSocialLink {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 2.25rem;
  height: 2.25rem;
  color: var(--vp-c-text-2);
  transition: color 0.5s;
}

.VPSocialLink:hover {
  color: var(--vp-c-text-1);
  transition: color 0.25s;
}

.VPSocialLink > :deep(span) {
  /* keeps a nested custom svg centered instead of baseline-aligned */
  display: flex;
  width: 1.25rem;
  height: 1.25rem;
}

.VPSocialLink :deep(svg) {
  fill: currentColor;
}
</style>
