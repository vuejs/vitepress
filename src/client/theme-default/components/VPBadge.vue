<script setup lang="ts">
interface Props {
  text?: string
  type?: 'info' | 'tip' | 'warning' | 'danger'
}
withDefaults(defineProps<Props>(), {
  type: 'tip'
})
</script>

<template>
  <span class="VPBadge" :class="type">
    <slot>{{ text }}</slot>
  </span>
</template>

<style>
.VPBadge {
  display: inline-block;
  margin-left: 0.125rem;
  border: 1px solid transparent;
  border-radius: 0.75rem;
  padding: 0 0.625rem;
  line-height: 1.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
  transform: translateY(-0.125rem);
}

.VPBadge.small {
  padding: 0 0.375rem;
  line-height: 1.125rem;
  font-size: 0.625rem;
  transform: translateY(-0.5rem);
}

.VPDocFooter .VPBadge {
  display: none;
}

.vp-doc h1 > .VPBadge,
.vp-doc h2 > .VPBadge {
  margin: 0 0 0 0.125rem;
  vertical-align: middle;
}

.vp-doc h2 > .VPBadge {
  padding: 0 0.5rem;
}

.vp-doc h3 > .VPBadge {
  vertical-align: middle;
}

.vp-doc h4 > .VPBadge,
.vp-doc h5 > .VPBadge,
.vp-doc h6 > .VPBadge {
  vertical-align: middle;
  line-height: 1.125rem;
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
