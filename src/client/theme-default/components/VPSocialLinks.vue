<script lang="ts" setup>
import type { DefaultTheme } from 'vitepress/theme'
import VPSocialLink from './VPSocialLink.vue'

defineProps<{
  links: DefaultTheme.SocialLink[]
}>()
</script>

<template>
  <div class="VPSocialLinks">
    <VPSocialLink
      v-for="{ link, icon, ariaLabel, title } in links"
      :key="link"
      :icon="icon"
      :link="link"
      :ariaLabel="ariaLabel"
      :title="title"
    />
  </div>
</template>

<style scoped>
.VPSocialLinks {
  display: flex;
  justify-content: center;
}
</style>
