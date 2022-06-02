<script lang="ts" setup>
import { inject } from 'vue'
import VPLink from './VPLink.vue'

defineProps<{
  text: string
  link: string
}>()

const closeScreen = inject('close-screen') as () => void
</script>

<template>
  <VPLink class="VPNavScreenMenuLink" :href="link" @click="closeScreen">
    {{ text }}
  </VPLink>
</template>

<style scoped>
.VPNavScreenMenuLink {
  display: block;
  border-bottom: .0625rem solid var(--vp-c-divider-light);
  padding: .75rem 0 .6875rem;
  line-height: 1.5rem;
  font-size: .875rem;
  font-weight: 500;
  color: var(--vp-c-text-1);
  transition: border-color 0.5s, color 0.25s;
}

.VPNavScreenMenuLink:hover {
  color: var(--vp-c-brand);
}
</style>
