<script lang="ts" setup>
defineProps<{
  active: boolean
}>()

defineEmits<{
  (e: 'click'): void
}>()
</script>

<template>
  <button
    type="button"
    class="VPNavBarHamburger"
    :class="{ active }"
    aria-label="mobile navigation"
    :aria-expanded="active"
    aria-controls="VPNavScreen"
    @click="$emit('click')"
  >
    <span class="container">
      <span class="top" />
      <span class="middle" />
      <span class="bottom" />
    </span>
  </button>
</template>

<style scoped>
.VPNavBarHamburger {
  display: flex;
  justify-content: center;
  align-items: center;
  inline-size: 48px;
  block-size: var(--vp-nav-height);
}

@media (min-width: 768px) {
  .VPNavBarHamburger {
    display: none;
  }
}

.container {
  position: relative;
  inline-size: 16px;
  block-size: 14px;
  overflow: hidden;
}

.VPNavBarHamburger:hover .top    { inset-block-start: 0; inset-inline-start: 0; transform: translateX(4px); }
.VPNavBarHamburger:hover .middle { inset-block-start: 6px; inset-inline-start: 0; transform: translateX(0); }
.VPNavBarHamburger:hover .bottom { inset-block-start: 12px; inset-inline-start: 0; transform: translateX(8px); }

.VPNavBarHamburger.active .top    { inset-block-start: 6px; transform: translateX(0) rotate(225deg); }
.VPNavBarHamburger.active .middle { inset-block-start: 6px; transform: translateX(16px); }
.VPNavBarHamburger.active .bottom { inset-block-start: 6px; transform: translateX(0) rotate(135deg); }

.VPNavBarHamburger.active:hover .top,
.VPNavBarHamburger.active:hover .middle,
.VPNavBarHamburger.active:hover .bottom {
  background-color: var(--vp-c-text-2);
  transition: top .25s, background-color .25s, transform .25s;
}

.top,
.middle,
.bottom {
  position: absolute;
  inline-size: 16px;
  block-size: 2px;
  background-color: var(--vp-c-text-1);
  transition: top .25s, background-color .5s, transform .25s;
}

.top    { inset-block-start: 0; inset-inline-start: 0; transform: translateX(0); }
.middle { inset-block-start: 6px; inset-inline-start: 0; transform: translateX(8px); }
.bottom { inset-block-start: 12px; inset-inline-start: 0; transform: translateX(4px); }
</style>
