<script setup lang="ts">
import { ref } from 'vue'
import { useData } from 'vitepress'
import VPIconChevronDown from './icons/VPIconChevronDown.vue'
import VPIconLanguages from './icons/VPIconLanguages.vue'

const { theme } = useData()

const isOpen = ref(false)

function toggle() {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <div v-if="theme.localeLinks" class="VPNavScreenTranslations" :class="{ open: isOpen }">
    <button class="title" @click="toggle">
      <VPIconLanguages class="icon lang" />
      {{ theme.localeLinks.text }}
      <VPIconChevronDown class="icon chevron" />
    </button>

    <ul class="list">
      <li v-for="locale in theme.localeLinks.items" :key="locale.link" class="item">
        <a class="link" :href="locale.link">{{ locale.text }}</a>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.VPNavScreenTranslations {
  height: 1.5rem;
  overflow: hidden;
}

.VPNavScreenTranslations.open {
  height: auto;
}

.title {
  display: flex;
  align-items: center;
  font-size: .875rem;
  font-weight: 500;
  color: var(--vp-c-text-1);
}

.icon {
  width: 1rem;
  height: 1rem;
  fill: currentColor;
}

.icon.lang {
  margin-right: .5rem;
}

.icon.chevron {
  margin-left: .25rem;
}

.list {
  padding: .25rem 0 0 1.5rem;
}

.link {
  line-height: 2rem;
  font-size: .8125rem;
  color: var(--vp-c-text-1);
}
</style>
