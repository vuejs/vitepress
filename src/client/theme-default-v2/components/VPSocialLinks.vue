<script lang="ts" setup>
import type { DefaultTheme } from 'vitepress/theme'
import VPSocialLink from './VPSocialLink.vue'

withDefaults(defineProps<{
  links: DefaultTheme.SocialLink[]
  me?: boolean
}>(), {
  me: true
})
</script>

<template>
  <div class="vp-social-links">
    <VPSocialLink
      v-for="{ link, icon, ariaLabel } in links"
      :key="link"
      :icon
      :link
      :ariaLabel
      :me
    />
  </div>
</template>

<style>
.vp-social-links {
  display: flex;
  justify-content: center;
}
</style>
