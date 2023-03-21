<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import { useData } from '../composables/data'

const { theme, page, lang } = useData()

const date = computed(() => new Date(page.value.lastUpdated!))
const isoDatetime = computed(() => date.value.toISOString())
const datetime = ref('')

watchEffect(() => {
  datetime.value = date.value.toLocaleString(lang.value)
})
</script>

<template>
  <p class="VPLastUpdated">
    {{ theme.lastUpdatedText || 'Last updated' }}:
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
