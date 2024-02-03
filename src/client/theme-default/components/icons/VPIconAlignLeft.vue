<script setup lang="ts">
import { useData } from '../../composables/data'

const { site } = useData()
</script>

<template>
  <svg>
    <use :href="`${site.base}vp-icons-sprite.svg#AlignLeft`"></use>
  </svg>
</template>
