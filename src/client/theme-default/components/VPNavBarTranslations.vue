<script lang="ts" setup>
import { ref } from 'vue'
import { useData } from 'vitepress'
import VPIconLanguages from './icons/VPIconLanguages.vue'
import VPFlyout from './VPFlyout.vue'

const { theme } = useData()

const isOpen = ref(false)

function toggle() {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <VPFlyout
    v-if="theme.localeLinks"
    class="VPNavBarTranslations"
    :icon="VPIconLanguages"
  >
    <div class="container">
      <p class="title">
        {{ theme.localeLinks.text }}
      </p>

      <ul class="list">
        <li v-for="locale in theme.localeLinks.items" :key="locale.link" class="lang">
          <a class="link" :href="locale.link">{{ locale.text }}</a>
        </li>
      </ul>
    </div>
  </VPFlyout>
</template>

<style scoped>
.VPNavBarTranslations {
  display: none;
}

@media (min-width: 1280px) {
  .VPNavBarTranslations {
    display: flex;
    align-items: center;
  }
}

.container {
  padding: 0 16px;
}

.title {
  display: flex;
  align-items: center;
  font-size: 13px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.lang {
  padding: 4px 0 0 0;
}

.link {
  line-height: 28px;
  font-size: 13px;
  color: var(--vp-c-text-1);
  transition: color 0.25s;
}

.link:hover {
  color: var(--vp-c-brand);
}
</style>
