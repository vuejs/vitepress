<script setup lang="ts">
import { useData } from '../composables/data'
import { computed } from 'vue'

interface Props {
  icon: string
  sprite?: 'vitepress' | 'social' | 'local-search'
  title?: string
  desc?: string
}

const props = withDefaults(defineProps<Props>(), {
  sprite: 'vitepress'
})

const { site } = useData()

const useSprite = computed(() => {
  switch (props.sprite) {
    case 'social':
      return 'vp-social-icons-sprite.svg'
    case 'local-search':
      return 'vp-local-search-icons-sprite.svg'
    case 'vitepress':
    default:
      return 'vp-icons-sprite.svg'
  }
})
const href = computed(() => `${site.value.base}${useSprite.value}#${props.icon}`)
</script>

<template>
  <svg>
    <title v-if="title">{{ title }}</title>
    <desc v-if="desc">{{ desc }}</desc>
    <use :href="href"></use>
  </svg>
</template>
