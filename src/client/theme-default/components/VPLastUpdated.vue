<script setup lang="ts">
import { ref, onMounted, watchEffect } from 'vue'
import { useData } from 'vitepress'

const { theme, page } = useData()

const datetime = ref('')
onMounted(() => {
  watchEffect(() => {
    // locale string might be different based on end user
    // and will lead to potential hydration mismatch if calculated at build time
    datetime.value = new Date(page.value.lastUpdated!).toLocaleString(window.navigator.language)
  })
})
</script>

<template>
  <div>
    {{ theme.lastUpdated ?? 'Edit this page' }}: {{ datetime }}
  </div>
</template>
