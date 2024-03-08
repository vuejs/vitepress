<script setup lang="ts">
import { computed } from 'vue'
import { useData } from '../composables/data'
import { clientComputed } from '../support/reactivity'

const { theme, page, frontmatter, lang } = useData()

const date = computed(
  () => new Date(frontmatter.value.lastUpdated ?? page.value.lastUpdated)
)
const isoDatetime = computed(() => date.value.toISOString())

const datetime = clientComputed(() => {
  return new Intl.DateTimeFormat(
    theme.value.lastUpdated?.formatOptions?.forceLocale ? lang.value : undefined,
    theme.value.lastUpdated?.formatOptions ?? { dateStyle: 'short', timeStyle: 'short' }
  ).format(date.value)
}, '')
</script>

<template>
  <p class="VPLastUpdated">
    {{ theme.lastUpdated?.text || theme.lastUpdatedText || 'Last updated' }}:
    <time :datetime="isoDatetime">{{ datetime }}</time>
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
