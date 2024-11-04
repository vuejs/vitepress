<script lang="ts" setup>
import type { SSGContext } from '../../shared'
import type { DefaultTheme } from 'vitepress/theme'
import { computed, useSSRContext } from 'vue'

const props = defineProps<{
  icon: DefaultTheme.SocialLinkIcon
  link: string
  ariaLabel?: string
}>()

const svg = computed(() => {
  if (typeof props.icon === 'object') return props.icon.svg
  const style = import.meta.env.DEV
    ? `style="--icon: url('https://api.iconify.design/simple-icons/${props.icon}.svg')" `
    : ''
  return `<span class="vpi-social-${props.icon}" ${style}></span>`
})

if (import.meta.env.SSR) {
  typeof props.icon === 'string' &&
    useSSRContext<SSGContext>()?.vpSocialIcons.add(props.icon)
}
</script>

<template>
  <a
    class="VPSocialLink no-icon"
    :href="link"
    :aria-label="ariaLabel ?? (typeof icon === 'string' ? icon : '')"
    target="_blank"
    rel="noopener"
    v-html="svg"
  ></a>
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
.VPSocialLink > :deep([class^='vpi-social-']) {
  width: 20px;
  height: 20px;
  fill: currentColor;
}
</style>
