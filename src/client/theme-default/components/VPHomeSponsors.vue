<script setup lang="ts">
import VPIconHeart from './icons/VPIconHeart.vue'
import VPButton from './VPButton.vue'
import VPSponsors from './VPSponsors.vue'

export interface Sponsors {
  tier: string
  size?: 'medium' | 'big'
  items: Sponsor[]
}

export interface Sponsor {
  name: string
  img: string
  url: string
}

defineProps<{
  message?: string
  actionText?: string
  actionLink?: string
  data: Sponsors[]
}>()
</script>

<template>
  <section class="VPHomeSponsors">
    <div class="container">
      <div class="header">
        <div class="love"><VPIconHeart class="icon" /></div>
        <h2 v-if="message" class="message">{{ message }}</h2>
      </div>

      <div class="sponsors">
        <VPSponsors :data="data" />
      </div>

      <div v-if="actionLink" class="action">
        <VPButton
          theme="sponsor"
          :text="actionText ?? 'Become a sponsor'"
          :href="actionLink"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.VPHomeSponsors {
  border-top: .0625rem solid var(--vp-c-divider-light);
  padding: 5.5rem 1.5rem 6rem;
  background-color: var(--vp-c-bg);
}

.container {
  margin: 0 auto;
  max-width: 60rem;
}

.love {
  margin: 0 auto;
  width: 1.75rem;
  height: 1.75rem;
  color: var(--vp-c-text-3);
}

.icon {
  width: 1.75rem;
  height: 1.75rem;
  fill: currentColor;
}

.message {
  margin: 0 auto;
  padding-top: .625rem;
  max-width: 20rem;
  text-align: center;
  line-height: 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  color: var(--vp-c-text-2);
}

.sponsors {
  padding-top: 2rem;
}

.action {
  padding-top: 2.5rem;
  text-align: center;
}
</style>
