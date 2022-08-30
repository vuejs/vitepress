<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    text?: string,
    type?: 'warning' | 'tip' | 'error' | 'info'
    vertical?: 'top' | 'middle'
  }>(), {
    text: '',
    type: 'tip',
    vertical: 'top',
  }
);
</script>

<template>
  <span
    class='VPBadge'
    :class="[ `VPBadge-type-${props.type}` ]"
    :style="{ 'vertical-align': props.vertical }"
  >
    <slot>{{ props.text }}</slot>
  </span>
</template>

<style scoped>
.VPBadge {
  display: inline-block;
  font-size: 14px;
  height: 18px;
  line-height: 18px;
  border-radius: 3px;
  padding: 0 6px;
  color: #fff;
}

.VPBadge.VPBadge-type-warning {
  background-color: var(--vp-c-badge-type-warning);
}

.VPBadge.VPBadge-type-tip {
  background-color: var(--vp-c-badge-type-tip);
}

.VPBadge.VPBadge-type-error {
  background-color: var(--vp-c-badge-type-error);
}

.VPBadge.VPBadge-type-info {
  background-color: var(--vp-c-badge-type-info);
}
</style>
