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
    <li v-for="{ link, icon, ariaLabel, target } in links" :key="link" class="item">
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

/* Reset styles from vp-doc if used in markdown */
.vp-doc .VPSocialLinks,
.vp-doc .VPSocialLinks .item {
  list-style: none;
  margin: 0;
  padding: 0;
}
</style>
