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
  <div class="VPSocialLinks">
    <VPSocialLink
      v-for="{ link, icon, ariaLabel, target } in links"
      :key="link"
      :icon
      :link
      :ariaLabel
      :target
      :me
    />
  </div>
</template>

<style scoped>
.VPSocialLinks {
  display: flex;
  justify-content: center;
}
</style>
