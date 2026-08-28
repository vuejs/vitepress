<script lang="ts" setup>
import { useIcon } from 'vitepress'
import type { DefaultTheme } from 'vitepress/theme'
import { useTemplateRef } from 'vue'

import { isExternal } from '../../shared'

const props = defineProps<{
  icon: DefaultTheme.SocialLinkIcon
  link: string
  ariaLabel?: string
  target?: string
  me: boolean
}>()

const el = useTemplateRef('el')
const iconClass = useIcon(() => props.icon, el)
</script>

<template>
  <a
    class="VPSocialLink no-icon"
    :href="link"
    :aria-label="ariaLabel ?? (typeof icon === 'string' ? icon : '')"
    :target="target ?? (isExternal(link) ? '_blank' : undefined)"
    :rel="me ? 'me noopener' : 'noopener'"
  >
    <span v-if="typeof icon === 'object'" v-html="icon.svg"></span>
    <span v-else ref="el" :class="iconClass"></span>
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
}

.VPSocialLink :deep(svg),
.VPSocialLink > :deep([class^='vpi-']) {
  width: 1.25rem;
  height: 1.25rem;
  fill: currentColor;
}
</style>
