<script setup lang="ts">
import { useNavigatorLanguage } from '@vueuse/core'
import { computed, onMounted, shallowRef, useTemplateRef, watchEffect } from 'vue'
import { useData } from '../composables/data'

const { theme, page, lang: pageLang } = useData()
const { language: browserLang } = useNavigatorLanguage()

const timeRef = useTemplateRef('timeRef')

const date = computed(() => new Date(page.value.lastUpdated!))
const isoDatetime = computed(() => date.value.toISOString())
const datetime = shallowRef('')

// set time on mounted hook to avoid hydration mismatch due to
// potential differences in timezones of the server and clients
onMounted(() => {
  watchEffect(() => {
    const lang = theme.value.lastUpdated?.formatOptions?.forceLocale
      ? pageLang.value
      : browserLang.value

    datetime.value = new Intl.DateTimeFormat(
      lang,
      theme.value.lastUpdated?.formatOptions ?? {
        dateStyle: 'medium',
        timeStyle: 'medium'
      }
    ).format(date.value)

    if (lang && pageLang.value !== lang) {
      timeRef.value?.setAttribute('lang', lang)
    } else {
      timeRef.value?.removeAttribute('lang')
    }
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
