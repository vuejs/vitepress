<script lang="ts" setup>
import VPFlyout from './VPFlyout.vue'
import VPMenuLink from './VPMenuLink.vue'
import { useData } from '../composables/data'
import { useLangs } from '../composables/langs'
import VPSocialLink from "./VPSocialLink.vue";
// import { computed } from 'vue'

const { theme } = useData()
const { localeLinks, currentLang } = useLangs({ correspondingLink: true })
// for helping translate
// const repoLink = computed(() => currentLang.value.repo || (localeLinks.value.length > 1 && localeLinks.value.some(l => !!l.repo)))
</script>

<template>
  <VPFlyout
    v-if="localeLinks.length && currentLang.label"
    class="VPNavBarTranslations"
    icon="vpi-languages"
    :label="theme.langMenuLabel || 'Change language'"
  >
    <div class="items">
      <div v-if="currentLang.repo">
        <div class="menu-item">
          <p class="title">{{ currentLang.label }}</p>
          <VPSocialLink icon="github" :link="currentLang.repo.link" :ariaLabel="currentLang.repo.title" />
        </div>
      </div>
      <p v-else class="title">{{ currentLang.label }}</p>

      <template v-for="locale in localeLinks" :key="locale.link">
        <div v-if="locale.repo" class="menu-item">
          <VPMenuLink :item="locale" />
          <VPSocialLink icon="github" :link="locale.repo.link" :ariaLabel="locale.repo.title" />
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
  position: relative;
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
