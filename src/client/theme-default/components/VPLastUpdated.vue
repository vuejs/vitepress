<script setup lang="ts">
import { ref, onMounted, watchEffect } from 'vue'
import { useData } from 'vitepress'

const { theme, page } = useData()
const data = new Date(page.value.lastUpdated!)
const isoDatetime = data.toISOString()
const datetime = ref('')

onMounted(() => {
  watchEffect(() => {
    // locale string might be different based on end user
    // and will lead to potential hydration mismatch if calculated at build time
    datetime.value = data.toLocaleString(window.navigator.language)
  })
})
</script>

<template>
  <div>
    {{ theme.lastUpdated ?? 'Edit this page' }}:
    <time :datatime="isoDatetime">
      {{ datetime }}
    </time>
  </div>
</template>
