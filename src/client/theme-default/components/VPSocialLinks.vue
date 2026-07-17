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
  <ul class="VPSocialLinks">
    <li v-for="{ link, icon, ariaLabel, target } in links" :key="link">
      <VPSocialLink
        :icon
        :link
        :ariaLabel
        :target
        :me
      />
    </li>
  </ul>
</template>

<style scoped>
.VPSocialLinks {
  display: flex;
  justify-content: center;
}
</style>
