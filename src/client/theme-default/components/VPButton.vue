<script setup lang="ts">
import { computed } from 'vue'
import type { DefaultTheme } from 'vitepress/theme'
import { normalizeLink } from '../support/utils'
import { EXTERNAL_URL_RE } from '../../shared'
import VPImage from './VPImage.vue'

interface Props {
  tag?: string
  size?: 'medium' | 'big'
  theme?: 'brand' | 'alt' | 'sponsor'
  text: string
  href?: string
  target?: string;
  rel?: string;
  startIcon?: DefaultTheme.ActionIcon;
  endIcon?: DefaultTheme.ActionIcon;
}
const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  theme: 'brand'
})

const isExternal = computed(
  () => props.href && EXTERNAL_URL_RE.test(props.href)
)

const component = computed(() => {
  return props.tag || (props.href ? 'a' : 'button')
})
</script>

<template>
  <component
    :is="component"
    class="VPButton"
    :class="[size, theme]"
    :href="href ? normalizeLink(href) : undefined"
    :target="props.target ?? (isExternal ? '_blank' : undefined)"
    :rel="props.rel ?? (isExternal ? 'noreferrer' : undefined)"
  >
    <span class="start-icon" v-if="startIcon">
      <VPImage
        v-if="typeof startIcon === 'object'"
        :image="startIcon"
        :alt="startIcon.alt"
        :height="startIcon.height || 32"
        :width="startIcon.width || 32"
      />
      <span v-else-if="startIcon" class="icon" v-html="startIcon"></span>
    </span>
    <span>{{ text }}</span>
    <span class="end-icon" v-if="endIcon">
      <VPImage
        v-if="typeof endIcon === 'object'"
        :image="endIcon"
        :alt="endIcon.alt"
        :height="endIcon.height || 32"
        :width="endIcon.width || 32"
      />
      <span v-else-if="endIcon" class="icon" v-html="endIcon"></span>
    </span>
  </component>
</template>

<style scoped>
.VPButton {
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid transparent;
  text-align: center;
  font-weight: 600;
  white-space: nowrap;
  transition: color 0.25s, border-color 0.25s, background-color 0.25s;
}

.VPButton:active {
  transition: color 0.1s, border-color 0.1s, background-color 0.1s;
}

.VPButton.medium {
  border-radius: 20px;
  padding: 0 20px;
  line-height: 38px;
  font-size: 14px;
}

.VPButton.big {
  border-radius: 24px;
  padding: 0 24px;
  line-height: 46px;
  font-size: 16px;
}

.VPButton.brand {
  border-color: var(--vp-button-brand-border);
  color: var(--vp-button-brand-text);
  background-color: var(--vp-button-brand-bg);
}

.VPButton.brand:hover {
  border-color: var(--vp-button-brand-hover-border);
  color: var(--vp-button-brand-hover-text);
  background-color: var(--vp-button-brand-hover-bg);
}

.VPButton.brand:active {
  border-color: var(--vp-button-brand-active-border);
  color: var(--vp-button-brand-active-text);
  background-color: var(--vp-button-brand-active-bg);
}

.VPButton.alt {
  border-color: var(--vp-button-alt-border);
  color: var(--vp-button-alt-text);
  background-color: var(--vp-button-alt-bg);
}

.VPButton.alt:hover {
  border-color: var(--vp-button-alt-hover-border);
  color: var(--vp-button-alt-hover-text);
  background-color: var(--vp-button-alt-hover-bg);
}

.VPButton.alt:active {
  border-color: var(--vp-button-alt-active-border);
  color: var(--vp-button-alt-active-text);
  background-color: var(--vp-button-alt-active-bg);
}

.VPButton.sponsor {
  border-color: var(--vp-button-sponsor-border);
  color: var(--vp-button-sponsor-text);
  background-color: var(--vp-button-sponsor-bg);
}

.VPButton.sponsor:hover {
  border-color: var(--vp-button-sponsor-hover-border);
  color: var(--vp-button-sponsor-hover-text);
  background-color: var(--vp-button-sponsor-hover-bg);
}

.VPButton.sponsor:active {
  border-color: var(--vp-button-sponsor-active-border);
  color: var(--vp-button-sponsor-active-text);
  background-color: var(--vp-button-sponsor-active-bg);
}

.VPButton:only-child{
  grid-template-columns: 1fr;
  grid-gap: 0;
}

.icon{
  display: flex;
  justify-content: center;
  align-items: center;
}

.start-icon {
  margin-right: 8px;
}

.end-icon {
  margin-left: 8px;
}
</style>
