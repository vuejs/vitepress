<script setup lang="ts">
import { useLangs } from '../composables/langs'
import { computed } from 'vue'
import { useData } from '../composables/data'
import VPSwitchAppearance from './VPSwitchAppearance.vue'

const { site, theme } = useData()
const { localeLinks, currentLang } = useLangs({ correspondingLink: true })

const state = computed(() => {
  const appearance = site.value.appearance

  const hasLanguages = localeLinks.value.length && currentLang.value.label
  const hasTheme = appearance && appearance !== 'force-dark' && appearance !== 'force-auto'
  const hasAction = hasLanguages || hasTheme

  return {
    hasAction,
    hasTheme,
    hasLanguages
  }
})

function onLanguageSelect(e: Event) {
  const select = e.target as HTMLSelectElement
  window.location.href = select.value
}
</script>

<template>
  <div class="vp-nav-screen-actions">
    <div v-if="state.hasLanguages" class="vp-nav-screen-actions__item">
      <!-- TODO: i18n -->
      <div class="vp-nav-screen-actions__label">
        Language
      </div>
      <div class="vp-nav-screen-actions__value">
        <div class="vp-nav-screen-actions__select">
          <select
            class="vp-nav-screen-actions__select-input"
            id="vp-nav-screen-actions-language"
            @change="onLanguageSelect"
          >
            <option :value="currentLang.link" selected>
              {{ currentLang.label }}
            </option>
            <option v-for="locale in localeLinks" :key="locale.link" :value="locale.link">
              {{ locale.text }}
            </option>
          </select>
          <div class="vp-nav-screen-actions__select-icon vpi-chevron-down" />
        </div>
      </div>
    </div>
    <div v-if="state.hasTheme" class="vp-nav-screen-actions__item">
      <div class="vp-nav-screen-actions__label">
        {{ theme.darkModeSwitchLabel || 'Appearance' }}
      </div>
      <div class="vp-nav-screen-actions__value">
        <VPSwitchAppearance />
      </div>
    </div>
  </div>
</template>

<style>
.vp-nav-screen-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  border-radius: 6px;
  background-color: var(--vp-c-gutter);
  overflow: clip;
}

.vp-nav-screen-actions__item {
  display: flex;
  align-items: center;
  padding: 0 8px 0 16px;
  width: 100%;
  height: 48px;
  background-color: var(--vp-c-bg-2);
}

.vp-nav-screen-actions__label {
  flex-shrink: 0;
  width: 112px;
  font-size: 14px;
  color: var(--vp-c-text-2);
}

.vp-nav-screen-actions__value {
  display: flex;
  justify-content: flex-end;
  flex-grow: 1;
}

.vp-nav-screen-actions__select {
  position: relative;
  width: 100%;
}

.vp-nav-screen-actions__select-input {
  position: relative;
  z-index: 1;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  padding: 0 10px;
  width: 100%;
  height: 32px;
  font-size: 14px;
  color: var(--vp-c-text-1);
  background-color: transparent;
}

.vp-nav-screen-actions__select-icon {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 0;
  width: 16px;
  height: 16px;
}
</style>
