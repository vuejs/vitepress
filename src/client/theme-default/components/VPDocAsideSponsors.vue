<script setup lang="ts">
import type { Sponsors } from './VPSponsors.vue'
import type { Sponsor } from './VPSponsorsGrid.vue'
import VPSponsors from './VPSponsors.vue'

defineProps<{
  tier?: string
  size?: 'xmini' | 'mini' | 'small'
  data: Sponsors[] | Sponsor[]
}>()
</script>

<template>
  <div class="VPDocAsideSponsors">
    <VPSponsors mode="aside" :tier :size :data />
  </div>
</template>
