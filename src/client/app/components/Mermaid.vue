<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRoute } from '../router.js'
import mermaid from 'mermaid'

const { src } = defineProps<{
  src: string
}>()

const svg = ref<string | null>(null)
const route = useRoute()

onMounted(() => {
  mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    ...route.data.mermaidConfig
  })
  const id = Math.floor(Math.random() * 100000)

  if (src) {
    mermaid.render('mermaid-' + id, src, (svgCode) => {
      svg.value = svgCode
    })
  }
})
</script>

<template>
  <div class="mermaid" v-html="svg">
  </div>
</template>