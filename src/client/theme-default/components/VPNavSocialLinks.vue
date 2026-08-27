<script lang="ts" setup>
import { computed } from 'vue'

import { useData } from '../composables/data'
import { useNavOverflow } from '../composables/nav-overflow'
import VPSocialLinks from './VPSocialLinks.vue'

const props = defineProps<{
  screen?: boolean
}>()

const { theme } = useData()

const overflow = props.screen ? null : useNavOverflow()

const isCollapsed = computed(() => !!overflow && !overflow.state.socialLinks)
</script>

<template>
  <VPSocialLinks
    v-if="theme.socialLinks"
    class="VPNavSocialLinks"
    :class="[
      screen ? 'VPNavScreenSocialLinks' : 'VPNavBarSocialLinks',
      { collapsed: isCollapsed }
    ]"
    :links="theme.socialLinks"
    :ref="(inst: any) => overflow?.setClusterEl('socialLinks', inst?.$el ?? null)"
  />
</template>

<style scoped>
.VPNavBarSocialLinks {
  display: none;
}

@media (min-width: 48rem) {
  .VPNavBarSocialLinks {
    display: flex;
    align-items: center;
  }
}
</style>
