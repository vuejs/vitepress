<script setup lang="ts">
import { useNavigatorLanguage } from '@vueuse/core'
import { computed, onMounted, shallowRef, useTemplateRef, watchEffect } from 'vue'
import { useData } from '../composables/data'

const { theme, page, lang: pageLang } = useData()
const { language: browserLang } = useNavigatorLanguage()

const props = defineProps<{
  isCreated?: boolean
}>()

const timeRef = useTemplateRef('timeRef')

const date = computed(() => new Date(props.isCreated ? page.value.created! : page.value.lastUpdated!))
const isoDatetime = computed(() => date.value.toISOString())
const datetime = shallowRef('')

// set time on mounted hook to avoid hydration mismatch due to
// potential differences in timezones of the server and clients
onMounted(() => {
  watchEffect(() => {
    const formatOptions = props.isCreated
      ? theme.value.created?.formatOptions
      : theme.value.lastUpdated?.formatOptions

    const lang = formatOptions?.forceLocale
      ? pageLang.value
      : browserLang.value

    datetime.value = new Intl.DateTimeFormat(
      lang,
      formatOptions ?? {
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
  <tr v-if="isCreated" class="VPCreated">
    <td>{{ theme.created?.text || 'Created' }}:</td>
    <td><time ref="timeRef" :datetime="isoDatetime">{{ datetime }}</time></td>
  </tr>
  <tr v-else class="VPLastUpdated">
    <td>{{ theme.lastUpdated?.text || theme.lastUpdatedText || 'Last updated' }}:</td>
    <td><time ref="timeRef" :datetime="isoDatetime">{{ datetime }}</time></td>
  </tr>
</template>

<style scoped>
.VPLastUpdated, .VPCreated {
  line-height: 24px;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-2);
}

@media (min-width: 640px) {
  .VPLastUpdated, .VPCreated {
    line-height: 32px;
    font-size: 14px;
    font-weight: 500;
  }
}

td {
  padding: 0;
}

td:first-child {
  padding-right: 4px;
  text-align: right;
}
</style>
