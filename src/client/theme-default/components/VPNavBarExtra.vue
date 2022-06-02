<script lang="ts" setup>
import { useData } from 'vitepress'
import VPFlyout from './VPFlyout.vue'
import VPMenuLink from './VPMenuLink.vue'
import VPSwitchAppearance from './VPSwitchAppearance.vue'
import VPSocialLinks from './VPSocialLinks.vue'

const { site, theme } = useData()
</script>

<template>
  <VPFlyout class="VPNavBarExtra" label="extra navigation">
    <div v-if="theme.localeLinks" class="group">
      <p class="trans-title">{{ theme.localeLinks.text }}</p>

      <template v-for="locale in theme.localeLinks.items" :key="locale.link">
        <VPMenuLink :item="locale" />
      </template>
    </div>

    <div v-if="site.appearance" class="group">
      <div class="item appearance">
        <p class="label">Appearance</p>
        <div class="appearance-action">
          <VPSwitchAppearance />
        </div>
      </div>
    </div>

    <div v-if="theme.socialLinks" class="group">
      <div class="item social-links">
        <VPSocialLinks class="social-links-list" :links="theme.socialLinks" />
      </div>
    </div>
  </VPFlyout>
</template>

<style scoped>
.VPNavBarExtra {
  display: none;
  margin-right: -0.75rem;
}

@media (min-width: 768px) {
  .VPNavBarExtra {
    display: block;
  }
}

@media (min-width: 1280px) {
  .VPNavBarExtra {
    display: none;
  }
}

.trans-title {
  padding: 0 1.5rem 0 .75rem;
  line-height: 2rem;
  font-size: .875rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.item.appearance,
.item.social-links {
  display: flex;
  align-items: center;
  padding: 0 .75rem;
}

.item.appearance {
  min-width: 11rem;
}

.appearance-action {
  margin-right: -0.125rem;
}

.social-links-list {
  margin: -0.25rem -0.5rem;
}
</style>
