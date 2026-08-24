<script lang="ts" setup>
import { useTemplateRef, watchEffect } from 'vue'

import { useData } from '../composables/data'
import { useNav } from '../composables/nav'

defineProps<{
  active: boolean
}>()

defineEmits<{
  (e: 'click'): void
}>()

const { theme } = useData()

// register as the screen's trigger so Escape can return focus here
const el = useTemplateRef('el')
const { screenTriggerEl } = useNav()

watchEffect(() => {
  screenTriggerEl.value = el.value
})
</script>

<template>
  <button
    ref="el"
    type="button"
    class="VPNavBarHamburger"
    :class="{ active }"
    :aria-label="theme.mobileMenuLabel || 'Menu'"
    :aria-expanded="active"
    @click="$emit('click')"
  >
    <span class="container" aria-hidden="true">
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
  transition: top 0.25s, background-color 0.25s, transform 0.25s;
}

.top,
.middle,
.bottom {
  position: absolute;
  width: 1rem;
  height: 0.125rem;
  background-color: var(--vp-c-text-1);
  transition: top 0.25s, background-color 0.5s, transform 0.25s;
}

.top    { top: 0; left: 0; transform: translateX(0); }
.middle { top: 0.375rem; left: 0; transform: translateX(0.5rem); }
.bottom { top: 0.75rem; left: 0; transform: translateX(0.25rem); }
</style>
