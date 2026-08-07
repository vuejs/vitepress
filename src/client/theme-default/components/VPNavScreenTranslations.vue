<script setup lang="ts">
import { ref } from 'vue'
import { useLangs } from '../composables/langs'
import VPLink from './VPLink.vue'

const { localeLinks, currentLang } = useLangs({
  linkToCorrespondingPage: true
})
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
      <span class="vpi-languages icon lang" />
      {{ currentLang.label }}
      <span class="vpi-chevron-down icon chevron" />
    </button>

    <ul class="list">
      <li v-for="locale in localeLinks" :key="locale.link" class="item">
        <VPLink
          class="link"
          :href="locale.link"
          :external="false"
          :lang="locale.lang"
          :hreflang="locale.lang"
          rel="alternate"
          :dir="locale.dir"
          data-allow-mismatch="attribute"
        >
          {{ locale.text }}
        </VPLink>
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
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--vp-c-text-1);
}

.icon {
  font-size: 1rem;
}

.icon.lang {
  margin-right: 0.5rem;
}

.icon.chevron {
  margin-left: 0.25rem;
}

.list {
  padding: 0.25rem 0 0 1.5rem;
}

.link {
  line-height: 2rem;
  font-size: 0.8125rem;
  color: var(--vp-c-text-1);
}
</style>
