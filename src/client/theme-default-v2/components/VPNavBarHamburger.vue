<script lang="ts" setup>
defineProps<{
  active: boolean
}>()

defineEmits<{
  click: []
}>()
</script>

<template>
  <button
    type="button"
    class="vp-nav-bar-hamburger"
    :class="{ 'vp-nav-bar-hamburger--is-active': active }"
    aria-label="mobile navigation"
    :aria-expanded="active"
    aria-controls="vp-nav-screen"
    @click="$emit('click')"
  >
    <span class="vp-nav-bar-hamburger__container">
      <span class="vp-nav-bar-hamburger__top" />
      <span class="vp-nav-bar-hamburger__middle" />
      <span class="vp-nav-bar-hamburger__bottom" />
    </span>
  </button>
</template>

<style>
.vp-nav-bar-hamburger {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: var(--vp-nav-height);

  @media (min-width: 768px) {
    display: none;
  }
}

:where(.vp-nav-bar-hamburger:hover) {
  .vp-nav-bar-hamburger__top    { top: 0; left: 0; transform: translateX(4px); }
  .vp-nav-bar-hamburger__middle { top: 6px; left: 0; transform: translateX(0); }
  .vp-nav-bar-hamburger__bottom { top: 12px; left: 0; transform: translateX(8px); }
}

:where(.vp-nav-bar-hamburger--is-active),
:where(.vp-nav-bar-hamburger--is-active:hover) {
  .vp-nav-bar-hamburger__top,
  .vp-nav-bar-hamburger__middle,
  .vp-nav-bar-hamburger__bottom {
    background-color: var(--vp-c-text-2);
    transition: top .25s, background-color .25s, transform .25s;
  }

  .vp-nav-bar-hamburger__top    { top: 6px; transform: translateX(0) rotate(225deg); }
  .vp-nav-bar-hamburger__middle { top: 6px; transform: translateX(16px); }
  .vp-nav-bar-hamburger__bottom { top: 6px; transform: translateX(0) rotate(135deg); }
}

.vp-nav-bar-hamburger__container {
  position: relative;
  width: 16px;
  height: 14px;
  overflow: hidden;
}

.vp-nav-bar-hamburger__top,
.vp-nav-bar-hamburger__middle,
.vp-nav-bar-hamburger__bottom {
  position: absolute;
  width: 16px;
  height: 2px;
  background-color: var(--vp-c-text-1);
  transition: top .25s, background-color .5s, transform .25s;
}

.vp-nav-bar-hamburger__top    { top: 0; left: 0; transform: translateX(0); }
.vp-nav-bar-hamburger__middle { top: 6px; left: 0; transform: translateX(8px); }
.vp-nav-bar-hamburger__bottom { top: 12px; left: 0; transform: translateX(4px); }
</style>
