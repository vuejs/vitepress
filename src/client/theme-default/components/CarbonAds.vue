<template>
  <div class="carbon-ads" ref="el" />
</template>

<script setup lang="ts">
import { defineProps, ref, onMounted } from 'vue'

const { code, placement } = defineProps<{
  code: string
  placement: string
}>()

const el = ref()

onMounted(() => {
  const s = document.createElement('script')
  s.id = '_carbonads_js'
  s.src = `//cdn.carbonads.com/carbon.js?serve=${code}&placement=${placement}`
  el.value.appendChild(s)
})
</script>

<style scoped>
.carbon-ads {
  padding: 1.75rem 0 0;
  border-radius: 4px;
  margin: 0 auto;
  max-width: 280px;
  font-size: .75rem;
  background-color: rgba(255, 255, 255, .8);
}

.carbon-ads::after {
  clear: both;
  display: block;
  content: "";
}

@media (min-width: 420px) {
  .carbon-ads {
    position: relative;
    right: -8px;
    z-index: 1;
    float: right;
    margin: -8px -8px 24px 24px;
    padding: 8px;
    width: 146px;
    max-width: 100%;
  }
}

@media (min-width: 1400px) {
  .carbon-ads {
    position: fixed;
    top: auto;
    right: 8px;
    bottom: 8px;
    float: none;
    margin: 0;
  }
}

.carbon-ads ::v-deep(.carbon-img) {
  float: left;
  margin-right: .75rem;
  max-width: 100px;
  border: 1px solid var(--c-divider);
}

@media (min-width: 420px) {
  .carbon-ads ::v-deep(.carbon-img) {
    float: none;
    display: block;
    margin-right: 0;
    max-width: 130px;
  }
}

.carbon-ads ::v-deep(.carbon-img img) {
  display: block;
  width: 100%;
}

@media (min-width: 420px) {
  .carbon-ads ::v-deep(.carbon-text) {
    padding-top: 8px;
  }
}

.carbon-ads ::v-deep(.carbon-text) {
  display: block;
  font-weight: 400;
  color: var(--c-text-light);
}

.carbon-ads ::v-deep(.carbon-poweredby) {
  display: block;
  padding-top: 2px;
  font-weight: 400;
  color: var(--c-text-lighter);
}
</style>
