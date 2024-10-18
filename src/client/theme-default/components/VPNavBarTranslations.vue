<script lang="ts" setup>
import VPFlyout from './VPFlyout.vue'
import VPMenuLink from './VPMenuLink.vue'
import { useData } from '../composables/data'
import { useLangs } from '../composables/langs'
import VPSocialLink from "./VPSocialLink.vue";

const { theme } = useData()
const { localeLinks, currentLang } = useLangs({ correspondingLink: true })
</script>

<template>
  <VPFlyout
    v-if="localeLinks.length && currentLang.label"
    class="VPNavBarTranslations"
    icon="vpi-languages"
    :label="theme.langMenuLabel || 'Change language'"
  >
    <div class="items">
      <div v-if="currentLang.repository">
        <div class="menu-item">
          <p class="title">{{ currentLang.label }}</p>
          <VPSocialLink
            :icon="currentLang.repository.icon ?? 'github'"
            :link="currentLang.repository.link"
            :ariaLabel="currentLang.repository.title"
          />
        </div>
      </div>
      <p v-else class="title">{{ currentLang.label }}</p>

      <template v-for="locale in localeLinks" :key="locale.link">
        <div v-if="locale.repository" class="menu-item">
          <VPMenuLink :item="locale" />
          <VPSocialLink
            :icon="locale.repository.icon ?? 'github'"
            :link="locale.repository.link"
            :ariaLabel="locale.repository.title"
          />
        </div>
        <VPMenuLink v-else :item="locale" />
      </template>
    </div>
  </VPFlyout>
</template>

<style scoped>
.VPNavBarTranslations {
  display: none;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

@media (min-width: 1280px) {
  .VPNavBarTranslations {
    display: flex;
    align-items: center;
  }
}

.title {
  padding: 0 24px 0 12px;
  line-height: 32px;
  font-size: 14px;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
</style>
