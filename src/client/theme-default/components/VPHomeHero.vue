<script setup lang="ts">
import { useData } from 'vitepress'
import VPHero from './VPHero.vue'

const { frontmatter: fm } = useData()
</script>

<template>
  <div v-if="fm.hero" class="VPHomeHero">
    <VPHero
      :name="fm.hero.name"
      :text="fm.hero.text"
      :tagline="fm.hero.tagline"
      :actions="fm.hero.actions"
    />
  </div>
</template>
