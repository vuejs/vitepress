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
  width: 3rem;
  height: var(--vp-nav-height);
}

@media (min-width: 48rem) {
  .VPNavBarHamburger {
    display: none;
  }
}

.container {
  position: relative;
  width: 1rem;
  height: 0.875rem;
  overflow: hidden;
}

.VPNavBarHamburger:hover .top    { top: 0; left: 0; transform: translateX(0.25rem); }
.VPNavBarHamburger:hover .middle { top: 0.375rem; left: 0; transform: translateX(0); }
.VPNavBarHamburger:hover .bottom { top: 0.75rem; left: 0; transform: translateX(0.5rem); }

.VPNavBarHamburger.active .top    { top: 0.375rem; transform: translateX(0) rotate(225deg); }
.VPNavBarHamburger.active .middle { top: 0.375rem; transform: translateX(1rem); }
.VPNavBarHamburger.active .bottom { top: 0.375rem; transform: translateX(0) rotate(135deg); }

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
  width: 1rem;
  height: 0.125rem;
  background-color: var(--vp-c-text-1);
  transition: top .25s, background-color .5s, transform .25s;
}

.top    { top: 0; left: 0; transform: translateX(0); }
.middle { top: 0.375rem; left: 0; transform: translateX(0.5rem); }
.bottom { top: 0.75rem; left: 0; transform: translateX(0.25rem); }
</style>
