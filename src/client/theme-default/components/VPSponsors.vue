<script setup lang="ts">
import { computed } from 'vue'
import VPSponsorsGrid from './VPSponsorsGrid.vue'

interface Sponsors {
  tier?: string
  size?: 'small' | 'medium' | 'big'
  items: Sponsor[]
}

interface Sponsor {
  name: string
  img: string
  url: string
}

const props = defineProps<{
  tier?: string
  size?: 'small' | 'medium' | 'big'
  data: Sposors[] | Sponsor[]
}>()

const sponsors = computed(() => {
  const isSponsors = props.data.some((s: any) => s.items)

  if (isSponsors) {
    return props.data
  }

  return [{
    tier: props.tier,
    size: props.size,
    items: props.data
  }]
})
</script>

<template>
  <div class="VPSponsors">
    <section v-for="(sponsor, index) in sponsors" :key="index" class="section">
      <h3 v-if="sponsor.tier" class="tier">{{ sponsor.tier }}</h3>
      <VPSponsorsGrid :size="sponsor.size" :data="sponsor.items" />
    </section>
  </div>
</template>

<style scoped>
.VPSponsors {
  border-radius: 16px;
  overflow: hidden;
}

.section + .section {
  margin-top: 4px;
}

.tier {
  margin-bottom: 4px;
  padding: 13px 0 11px;
  text-align: center;
  letter-spacing: 1px;
  line-height: 24px;
  width: 100%;
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-text-2);
  background-color: var(--vp-c-white-soft);
}

.dark .tier {
  background-color: var(--vp-c-black-mute);
}

.VPSponsorsGrid + .tier {
  margin-top: 4px;
}
</style>
