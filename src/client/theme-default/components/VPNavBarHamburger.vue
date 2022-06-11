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
    <span class="menu-container">
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
  width: 48px;
  height: var(--vp-nav-height);
}

@media (min-width: 768px) {
  .VPNavBarHamburger {
    display: none;
  }
}

.menu-container {
  position: relative;
  width: 16px;
  height: 14px;
  overflow: hidden;
}

.menu-container:hover .top    { top: 0; left: 0; transform: translateX(4px); }
.menu-container:hover .middle { top: 6; left: 0; transform: translateX(0); }
.menu-container:hover .bottom { top: 12px; left: 0; transform: translateX(8px); }

.active .menu-container .top    { top: 6px; transform: translateX(0) rotate(225deg); }
.active .menu-container .middle { top: 6px; transform: translateX(16px); }
.active .menu-container .bottom { top: 6px; transform: translateX(0) rotate(135deg); }

.active .menu-container:hover .top,
.active .menu-container:hover .middle,
.active .menu-container:hover .bottom {
  background-color: var(--vp-c-text-2);
  transition: top .25s, background-color .25s, transform .25s;
}

.top,
.middle,
.bottom {
  position: absolute;
  width: 16px;
  height: 2px;
  background-color: var(--vp-c-text-1);
  transition: top .25s, background-color .5s, transform .25s;
}

.top    { top: 0; left: 0; transform: translateX(0); }
.middle { top: 6px; left: 0; transform: translateX(8px); }
.bottom { top: 12px; left: 0; transform: translateX(4px); }
</style>
