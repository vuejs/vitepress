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
  width: 2.5rem;
  height: 1.375rem;
  flex-shrink: 0;
  border: .0625rem solid var(--vp-c-divider);
  background-color: var(--vp-c-bg-mute);
  transition: border-color 0.25s, background-color 0.25s;
}

.VPSwitch:hover {
  border-color: var(--vp-c-gray);
}

.check {
  position: absolute;
  top: .0625rem;
  left: .0625rem;
  width: 1.125rem;
  height: 1.125rem;
  border-radius: 50%;
  background-color: var(--vp-c-white);
  box-shadow: var(--vp-shadow-1);
  transition: background-color 0.25s, transform 0.25s;
}

.dark .check {
  background-color: var(--vp-c-black);
}

.icon {
  position: relative;
  display: block;
  width: 1.125rem;
  height: 1.125rem;
  border-radius: 50%;
  overflow: hidden;
}

.icon :deep(svg) {
  position: absolute;
  top: .1875rem;
  left: .1875rem;
  width: .75rem;
  height: .75rem;
  fill: var(--vp-c-text-2);
}

.dark .icon :deep(svg) {
  fill: var(--vp-c-text-1);
  transition: opacity 0.25s;
}
</style>
