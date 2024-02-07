<script lang="ts" setup>
import type { DefaultTheme } from 'vitepress/theme'
import { computed } from 'vue'
// import { icons } from '../support/socialIcons'

const props = defineProps<{
  icon: DefaultTheme.SocialLinkIcon
  link: string
  ariaLabel?: string
}>()

const svg = computed(() => {
  if (typeof props.icon === 'object') return { svg: props.icon.svg }
  return `vp-social-icon-${props.icon}`
})
</script>

<template>
  <a
    v-if="typeof svg === 'object'"
    class="VPSocialLink no-icon"
    :href="link"
    :aria-label="ariaLabel ?? (typeof icon === 'string' ? icon : '')"
    target="_blank"
    rel="noopener"
    v-html="svg"
  >
  </a>
  <a
      v-else
      class="VPSocialLink no-icon"
      :href="link"
      :aria-label="ariaLabel ?? (typeof icon === 'string' ? icon : '')"
      target="_blank"
      rel="noopener"
  >
    <span class="vp-icon" :class="svg" />
  </a>
</template>

<style scoped>
.VPSocialLink {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 36px;
  height: 36px;
  color: var(--vp-c-text-2);
  transition: color 0.5s;
}

.VPSocialLink:hover {
  color: var(--vp-c-text-1);
  transition: color 0.25s;
}

.VPSocialLink > :deep(svg),
.VPSocialLink > .vp-icon {
  width: 20px;
  height: 20px;
  fill: currentColor;
}
</style>
