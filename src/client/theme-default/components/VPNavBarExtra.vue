<script lang="ts" setup>
import { useData } from 'vitepress'
import VPFlyout from './VPFlyout.vue'
import VPSwitchAppearance from './VPSwitchAppearance.vue'
import VPSocialLinks from './VPSocialLinks.vue'

const { site, theme } = useData()
</script>

<template>
  <VPFlyout class="VPNavBarExtra" label="extra navigation">
    <div v-if="theme.localeLinks" class="group">
      <div class="trans">
        <p class="trans-title">
          {{ theme.localeLinks.text }}
        </p>

        <ul class="trans-list">
          <li v-for="locale in theme.localeLinks.items" :key="locale.link" class="trans-item">
            <a class="trans-link" :href="locale.link">{{ locale.text }}</a>
          </li>
        </ul>
      </div>
    </div>

    <div v-if="site.appearance" class="group">
      <div class="item">
        <p class="label">Appearance</p>
        <div class="appearance-action">
          <VPSwitchAppearance />
        </div>
      </div>
    </div>

    <div v-if="theme.socialLinks" class="group">
      <div class="item">
        <VPSocialLinks class="social-links" :links="theme.socialLinks" />
      </div>
    </div>
  </VPFlyout>
</template>

<style scoped>
.VPNavBarExtra {
  display: none;
  margin-right: -12px;
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

.trans {
  padding: 2px 16px 0;
}

.trans-title {
  display: flex;
  align-items: center;
  font-size: 13px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.trans-icon {
  margin-right: 12px;
  width: 16px;
  height: 16px;
  fill: currentColor;
}

.trans-list {
  padding: 2px 0 0 0;
}

.trans-link {
  line-height: 28px;
  font-size: 13px;
  color: var(--vp-c-text-1);
  transition: color 0.25s;
}

.trans-link:hover {
  color: var(--vp-c-brand);
}

.item {
  display: flex;
  align-items: center;
}

.appearance-action {
  margin-right: -2px;
}

.social-links {
  margin: -4px -8px;
}
</style>
