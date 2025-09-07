<script setup lang="ts">
import { ref, computed, watchEffect, onMounted, useTemplateRef } from 'vue'
import { useData } from '../composables/data'
import { useNavigatorLanguage } from '@vueuse/core'

const { theme, page, lang } = useData()
const { language } = useNavigatorLanguage()

const timeRef = useTemplateRef('timeRef')

const date = computed(
  () => new Date(page.value.lastUpdated!)
)
const isoDatetime = computed(() => date.value.toISOString())
const datetime = ref('')

// set time on mounted hook to avoid hydration mismatch due to
// potential differences in timezones of the server and clients
onMounted(() => {
  watchEffect(() => {
    const browserLang = theme.value.lastUpdated?.formatOptions?.forceLocale ? lang.value : language.value
    datetime.value = new Intl.DateTimeFormat(
      browserLang,
      theme.value.lastUpdated?.formatOptions ?? {
        dateStyle: 'medium',
        timeStyle: 'medium'
      }
    ).format(date.value)
    if (browserLang && lang.value !== browserLang) {
      timeRef.value?.setAttribute('lang', browserLang)
    }
    else {
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
