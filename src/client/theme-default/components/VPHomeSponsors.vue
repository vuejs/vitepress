<script setup lang="ts">
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
interface Props {
  message?: string
  actionText?: string
  actionLink?: string
  data: Sponsors[]
}

withDefaults(defineProps<Props>(), {
  actionText: 'Become a sponsor'
})
</script>

<template>
  <section class="VPHomeSponsors">
    <div class="container">
      <div class="header">
        <div class="love">
          <span class="vpi-heart icon" />
        </div>
        <h2 v-if="message" class="message">{{ message }}</h2>
      </div>

      <div class="sponsors">
        <VPSponsors :data />
      </div>

      <div v-if="actionLink" class="action">
        <VPButton theme="sponsor" :text="actionText" :href="actionLink" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.VPHomeSponsors {
  border-top: 1px solid var(--vp-c-gutter);
  padding-top: 5.5rem !important;
}

.VPHomeSponsors {
  margin: 6rem 0;
}

@media (min-width: 48rem) {
  .VPHomeSponsors {
    margin: 8rem 0;
  }
}

.VPHomeSponsors {
  padding: 0 1.5rem;
}

@media (min-width: 48rem) {
  .VPHomeSponsors {
    padding: 0 3rem;
  }
}

@media (min-width: 60rem) {
  .VPHomeSponsors {
    padding: 0 4rem;
  }
}

.container {
  margin: 0 auto;
  max-width: 72rem;
}

.love {
  margin: 0 auto;
  width: fit-content;
  font-size: 1.75rem;
  color: var(--vp-c-text-3);
}

.icon {
  display: inline-block;
}

.message {
  margin: 0 auto;
  padding-top: 0.625rem;
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
