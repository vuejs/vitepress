<script lang="ts" setup>
import VPMenuLink from './VPMenuLink.vue'

defineProps<{
  text?: string
  items: any[]
}>()
</script>

<template>
  <div class="VPMenuGroup">
    <p v-if="text" class="title">{{ text }}</p>

    <template v-for="item in items">
      <VPMenuLink v-if="'link' in item" :item="item" />
    </template>
  </div>
</template>

<style scoped>
.VPMenuGroup + .VPMenuGroup {
  margin-top: 8px;
  border-top: 1px solid var(--vp-c-divider-light);
  padding-top: 8px;
}

.title {
  padding: 0 16px;
  line-height: 28px;
  font-size: 13px;
  font-weight: 600;
  color: var(--vp-c-text-2);
  transition: color 0.25s;
}
</style>
