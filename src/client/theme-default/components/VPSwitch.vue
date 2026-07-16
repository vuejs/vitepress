<template>
  <button class="VPSwitch" type="button" role="switch">
    <span class="check">
      <span class="icon" v-if="$slots.default">
        <slot />
      </span>
    </span>
  </button>
</template>

<style scoped>
.VPSwitch {
  position: relative;
  border-radius: 0.6875rem;
  display: block;
  width: 2.5rem;
  height: 1.375rem;
  flex-shrink: 0;
  border: 1px solid var(--vp-input-border-color);
  background-color: var(--vp-input-switch-bg-color);
  transition: border-color 0.25s !important;
}

.VPSwitch:hover {
  border-color: var(--vp-c-brand-1);
}

.check {
  position: absolute;
  top: 1px;
  /*rtl:ignore*/
  left: 1px;
  width: 1.125rem;
  height: 1.125rem;
  border-radius: 50%;
  background-color: var(--vp-c-neutral-inverse);
  box-shadow: var(--vp-shadow-1);
  transition: transform 0.25s !important;
}

.icon {
  position: relative;
  display: block;
  width: 1.125rem;
  height: 1.125rem;
  border-radius: 50%;
  overflow: hidden;
}

.icon :deep([class^='vpi-']) {
  position: absolute;
  top: 0.1875rem;
  left: 0.1875rem;
  width: 0.75rem;
  height: 0.75rem;
  color: var(--vp-c-text-2);
}

.dark .icon :deep([class^='vpi-']) {
  color: var(--vp-c-text-1);
  transition: opacity 0.25s !important;
}
</style>
