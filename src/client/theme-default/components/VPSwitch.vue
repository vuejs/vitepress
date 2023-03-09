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
  border-radius: 11px;
  display: block;
  inline-size: 40px;
  block-size: 22px;
  flex-shrink: 0;
  border: 1px solid var(--vp-input-border-color);
  background-color: var(--vp-input-switch-bg-color);
  transition: border-color 0.25s;
}

.VPSwitch:hover {
  border-color: var(--vp-input-hover-border-color);
}

.check {
  position: absolute;
  inset-block-start: 1px;
  /*rtl:ignore*/
  inset-inline-start: 1px;
  inline-size: 18px;
  block-size: 18px;
  border-radius: 50%;
  background-color: var(--vp-c-neutral-inverse);
  box-shadow: var(--vp-shadow-1);
  transition: transform 0.25s;
}

.icon {
  position: relative;
  display: block;
  inline-size: 18px;
  block-size: 18px;
  border-radius: 50%;
  overflow: hidden;
}

.icon :deep(svg) {
  position: absolute;
  inset-block-start: 3px;
  inset-inline-start: 3px;
  inline-size: 12px;
  block-size: 12px;
  fill: var(--vp-c-text-2);
}

.dark .icon :deep(svg) {
  fill: var(--vp-c-text-1);
  transition: opacity 0.25s;
}
</style>
