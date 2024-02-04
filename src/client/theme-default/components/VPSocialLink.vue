<script lang="ts" setup>
import type { DefaultTheme } from 'vitepress/theme'
import { computed } from 'vue'
// import { icons } from '../support/socialIcons'

const icons = {
  'discord': 'i-vitepress:discord',
  'facebook': 'i-vitepress:facebook',
  'github': 'i-vitepress:github',
  'instagram': 'i-vitepress:instagram',
  'linkedin': 'i-vitepress:linkedin',
  'mastodon': 'i-vitepress:mastodon',
  'npm': 'i-vitepress:npm',
  'slack': 'i-vitepress:slack',
  'twitter': 'i-vitepress:twitter',
  'x': 'i-vitepress:x',
  'youtube': 'i-vitepress:youtube',
} satisfies Record<string, string>

const props = defineProps<{
  icon: DefaultTheme.SocialLinkIcon
  link: string
  ariaLabel?: string
}>()

const svg = computed(() => {
  if (typeof props.icon === 'object') return props.icon.svg
  return icons[props.icon]
})
</script>

<template>
  <a
    v-if="typeof icon === 'object'"
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
    <span v-if="svg" :class="svg" />
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

.VPSocialLink > :deep(svg), .VPSocialLink > :deep([class^="i-vitepress:"]) {
  width: 20px;
  height: 20px;
  fill: currentColor;
}
</style>
