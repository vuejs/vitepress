<script setup lang="ts">
import { ref } from 'vue'
import VPIconChevronDown from './icons/VPIconChevronDown.vue'
import VPIconLanguages from './icons/VPIconLanguages.vue'
import { useLangs } from '../composables/langs'
import VPLink from './VPLink.vue'

const { localeLinks, currentLang } = useLangs({ correspondingLink: true })
const isOpen = ref(false)

function toggle() {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <div
    v-if="localeLinks.length && currentLang.label"
    class="VPNavScreenTranslations"
    :class="{ open: isOpen }"
  >
    <button class="title" @click="toggle">
      <VPIconLanguages class="icon lang" />
      {{ currentLang.label }}
      <VPIconChevronDown class="icon chevron" />
    </button>

    <ul class="list">
      <li v-for="locale in localeLinks" :key="locale.link" class="item">
        <VPLink class="link" :href="locale.link">{{ locale.text }}</VPLink>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.VPNavScreenTranslations {
  height: 24px;
  overflow: hidden;
}

.VPNavScreenTranslations.open {
  height: auto;
}

.title {
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-1);
}

.icon {
  width: 16px;
  height: 16px;
  fill: currentColor;
}

.icon.lang {
  margin-right: 8px;
}

.icon.chevron {
  margin-left: 4px;
}

.list {
  padding: 4px 0 0 24px;
}

.link {
  line-height: 32px;
  font-size: 13px;
  color: var(--vp-c-text-1);
}
</style>
