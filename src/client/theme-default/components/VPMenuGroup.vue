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
.VPMenuGroup {
  margin: .75rem -0.75rem 0;
  border-top: .0625rem solid var(--vp-c-divider-light);
  padding: .75rem .75rem 0;
}

.VPMenuGroup:first-child {
  margin-top: 0;
  border-top: 0;
  padding-top: 0;
}

.VPMenuGroup + .VPMenuGroup {
  margin-top: .75rem;
  border-top: .0625rem solid var(--vp-c-divider-light);
}

.title {
  padding: 0 .75rem;
  line-height: 2rem;
  font-size: .875rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
  transition: color 0.25s;
}
</style>
