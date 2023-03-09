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
  border-block-start: 1px solid var(--vp-c-gutter);
  padding: 88px 24px 96px;
  background-color: var(--vp-c-bg);
}

.container {
  margin-inline: auto;
  max-inline-size: 1152px;
}

.love {
  margin-inline: auto;
  inline-size: 28px;
  block-size: 28px;
  color: var(--vp-c-text-3);
}

.icon {
  inline-size: 28px;
  block-size: 28px;
  fill: currentColor;
}

.message {
  margin-inline: auto;
  padding-block-start: 10px;
  max-inline-size: 320px;
  text-align: center;
  line-height: 24px;
  font-size: 16px;
  font-weight: 500;
  color: var(--vp-c-text-2);
}

.sponsors {
  padding-block-start: 32px;
}

.action {
  padding-block-start: 40px;
  text-align: center;
}
</style>
