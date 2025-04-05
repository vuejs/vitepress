<script setup lang="ts">
import { ref, computed, watchEffect, onMounted } from 'vue'
import { useData } from '../composables/data'

const { theme, page, lang } = useData()

const date = computed(
  () => new Date(page.value.lastUpdated!)
)
const isoDatetime = computed(() => date.value.toISOString())
const datetime = ref('')
const timeRef = ref<HTMLTimeElement>()

// set time on mounted hook to avoid hydration mismatch due to
// potential differences in timezones of the server and clients
onMounted(() => {
  const defaultLocale = Intl.DateTimeFormat().resolvedOptions().locale
  function findBestLocaleMatch(pageLocale: string) {
    const lang = navigator.languages.find((userLang) => {
      if (pageLocale === userLang)
        return true

      // Edge browser: case for ca-valencia
      if (pageLocale === 'ca-valencia' && userLang === 'ca-Es-VALENCIA')
        return true

      // add iso-639 support for Latin America
      if (userLang.startsWith('es-') && userLang !== 'es-ES' && pageLocale === 'es-419')
        return true

      return userLang.startsWith(pageLocale)
    }) ?? defaultLocale

    if (lang !== pageLocale) {
      timeRef.value?.setAttribute('lang', lang)
    }
    else {
      timeRef.value?.removeAttribute('lang')
    }

    return lang
  }
  watchEffect(() => {
    datetime.value = new Intl.DateTimeFormat(
      theme.value.lastUpdated?.formatOptions?.forceLocale
        ? lang.value
        : findBestLocaleMatch(lang.value),
      theme.value.lastUpdated?.formatOptions ?? {
        dateStyle: 'short',
        timeStyle: 'short'
      }
    ).format(date.value)
  })
})
</script>

<template>
  <p class="VPLastUpdated">
    {{ theme.lastUpdated?.text || theme.lastUpdatedText || 'Last updated' }}:
    <time ref="timeRef" :datetime="isoDatetime">{{ datetime }}</time>
  </p>
</template>

<style scoped>
.VPLastUpdated {
  line-height: 24px;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-2);
}

@media (min-width: 640px) {
  .VPLastUpdated {
    line-height: 32px;
    font-size: 14px;
    font-weight: 500;
  }
}
</style>
