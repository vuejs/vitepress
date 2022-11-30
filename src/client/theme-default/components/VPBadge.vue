<script setup lang="ts">
defineProps<{
  text?: string
  type?: 'info' | 'tip' | 'warning' | 'danger'
}>()
</script>

<template>
  <span class="VPBadge" :class="type ?? 'tip'">
    <slot>{{ text }}</slot>
  </span>
</template>

<style scoped>
.VPBadge {
  display: inline-block;
  margin-left: 2px;
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 0 8px;
  line-height: 18px;
  font-size: 12px;
  font-weight: 600;
  transform: translateY(-2px);
}

h1 .VPBadge,
h2 .VPBadge,
h3 .VPBadge,
h4 .VPBadge,
h5 .VPBadge,
h6 .VPBadge {
  vertical-align: top;
}

h2 .VPBadge {
  border-radius: 11px;
  line-height: 20px;
}

.VPBadge.info {
  border-color: var(--vp-badge-info-border);
  color: var(--vp-badge-info-text);
  background-color: var(--vp-badge-info-bg);
}

.VPBadge.tip {
  border-color: var(--vp-badge-tip-border);
  color: var(--vp-badge-tip-text);
  background-color: var(--vp-badge-tip-bg);
}

.VPBadge.warning {
  border-color: var(--vp-badge-warning-border);
  color: var(--vp-badge-warning-text);
  background-color: var(--vp-badge-warning-bg);
}

.VPBadge.danger {
  border-color: var(--vp-badge-danger-border);
  color: var(--vp-badge-danger-text);
  background-color: var(--vp-badge-danger-bg);
}
</style>
