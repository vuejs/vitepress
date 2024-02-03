<script lang="ts" setup>
import type { DefaultTheme } from 'vitepress/theme'
import { computed } from 'vue'

const props = defineProps<{
  icon: DefaultTheme.SocialLinkIcon
  link: string
  ariaLabel?: string
}>()

const svgSpriteRegex = __SOCIAL_SVG_SPRITE_ICONS__
  ? /\.\/sprite-social-icons\/VP(.*)Icon\.vue/
  : /\.\/social-icons\/VP(.*)Icon\.vue/

const icons = Object.entries(__SOCIAL_SVG_SPRITE_ICONS__
    ?
    import.meta.glob('./sprite-social-icons/*.vue', {
      eager: true,
      import: 'default'
    })
    : import.meta.glob('./social-icons/*.vue', {
      eager: true,
      import: 'default'
    })
).reduce(
    (acc, [path, component]) => {
      const name = path
          .match(svgSpriteRegex)![1]
          .toLowerCase()
      acc[name] = component
      return acc
    },
    {} as Record<string, any>
)

const svg = computed(() => {
  if (__SOCIAL_SVG_SPRITE_ICONS__) {
    if (typeof props.icon === 'object' && 'id' in props.icon) return 'id' in props.icon ? icons[props.icon.id] : undefined
  }

  if (typeof props.icon === 'object') return 'svg' in props.icon ? { svg: props.icon.svg } : undefined

  return icons[props.icon]
})
</script>

<template>
  <a
    v-if="typeof svg === 'object' && svg.svg"
    class="VPSocialLink no-icon"
    :href="link"
    :aria-label="ariaLabel ?? (typeof icon === 'string' ? icon : '')"
    target="_blank"
    rel="noopener"
    v-html="svg.svg"
  >
  </a>
  <a
    v-else
    class="VPSocialLink"
    :href="link"
    :aria-label="ariaLabel ?? (typeof icon === 'string' ? icon : '')"
    target="_blank"
    rel="noopener"
  >
    <component v-if="svg" :is="svg" />
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

.VPSocialLink > :deep(svg) {
  width: 20px;
  height: 20px;
  fill: currentColor;
}
</style>
