<script lang="ts" setup generic="T extends DefaultTheme.NavItem">
import { onKeyStroke, useEventListener } from '@vueuse/core'
import { useRoute } from 'vitepress'
import type { DefaultTheme } from 'vitepress/theme'
import { ref, useId, useTemplateRef, watch } from 'vue'

import { useFlyout } from '../composables/flyout'
import VPMenu from './VPMenu.vue'

defineProps<{
  icon?: string
  button?: string
  label?: string
  items?: T[]
}>()

const open = ref(false)
const el = useTemplateRef('el')
const buttonEl = useTemplateRef('buttonEl')
const menuEl = useTemplateRef('menuEl')
const menuId = useId()

useFlyout({ el, onBlur: close })

const route = useRoute()
watch(() => route.path, close)

// for mouse users the disclosure opens and closes on hover, with the same
// boundary in both directions: the button plus the open panel. The root box
// isn't used — it also contains the ::before divider some contexts draw
// before the flyout, which should act as a neutral gap either way. Closing
// needs no delay: leaving for the panel (or back) is detected via
// relatedTarget, and any real exit closes instantly so a panel never
// lingers over a neighboring flyout while sweeping across the bar.

// a hover-open absorbs the click that usually follows it, otherwise mouse
// users would toggle the menu right back off
let openedByHover = false

function onPointerEnter(e: PointerEvent) {
  if (e.pointerType !== 'mouse') return
  if (!open.value) {
    open.value = true
    openedByHover = true
  }
}

function onPointerLeave(e: PointerEvent) {
  if (e.pointerType !== 'mouse') return
  const to = e.relatedTarget as Node | null
  // still within the button ∪ panel region — not an exit
  if (to && (buttonEl.value?.contains(to) || menuEl.value?.contains(to))) return
  close()
}

function toggle() {
  if (open.value && openedByHover) {
    openedByHover = false
    return
  }
  openedByHover = false
  open.value = !open.value
}

function close() {
  open.value = false
  openedByHover = false
}

// content shown on hover must be dismissible without moving the pointer
// (WCAG 1.4.13) — Escape closes and, if focus was inside, returns it to the
// trigger
onKeyStroke('Escape', () => {
  if (!open.value) return
  const restoreFocus = el.value?.contains(document.activeElement)
  close()
  if (restoreFocus) {
    el.value?.querySelector('button')?.focus()
  }
})

// a tap on a non-focusable area outside doesn't move focus, so the
// focus-tracking blur alone can't dismiss the menu on touch
useEventListener('pointerdown', (e) => {
  if (open.value && el.value && !el.value.contains(e.target as Node)) close()
})
</script>

<template>
  <div class="VPFlyout" ref="el">
    <button
      ref="buttonEl"
      type="button"
      class="button"
      :aria-expanded="open"
      :aria-controls="menuId"
      :aria-label="label"
      @pointerenter="onPointerEnter"
      @pointerleave="onPointerLeave"
      @click="toggle"
    >
      <span v-if="button || icon" class="text">
        <span v-if="icon" :class="[icon, 'option-icon']" aria-hidden="true" />
        <span v-if="button" v-html="button"></span>
        <span class="vpi-chevron-down text-icon" aria-hidden="true" />
      </span>

      <span v-else class="vpi-more-horizontal icon" aria-hidden="true" />
    </button>

    <div ref="menuEl" class="menu" :id="menuId" @pointerleave="onPointerLeave">
      <VPMenu :items>
        <slot />
      </VPMenu>
    </div>
  </div>
</template>

<style scoped>
.VPFlyout {
  position: relative;
}

.VPFlyout:hover {
  color: var(--vp-c-brand-1);
  transition: color 0.25s;
}

.VPFlyout:hover .text {
  color: var(--vp-c-text-2);
}

.VPFlyout:hover .icon {
  fill: var(--vp-c-text-2);
}

.VPFlyout.active .text {
  color: var(--vp-c-brand-1);
}

.VPFlyout.active:hover .text {
  color: var(--vp-c-brand-2);
}

/* closing is snappier than opening so a panel doesn't linger over the
   neighboring flyout's panel while sweeping across the bar */
.button[aria-expanded="false"] + .menu {
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.1s, visibility 0.1s;
}

.button[aria-expanded="true"] + .menu {
  opacity: 1;
  visibility: visible;
}

.button {
  display: flex;
  align-items: center;
  padding: 0 0.75rem;
  height: var(--vp-nav-height);
  color: var(--vp-c-text-1);
  transition: color 0.5s;
}

.text {
  display: flex;
  align-items: center;
  line-height: var(--vp-nav-height);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--vp-c-text-1);
  transition: color 0.25s;
}

.option-icon {
  font-size: 1rem;
}

.text-icon {
  margin-left: 0.25rem;
  font-size: 0.875rem;
}

.icon {
  font-size: 1.25rem;
  transition: fill 0.25s;
}

.menu {
  position: absolute;
  top: calc(var(--vp-nav-height) / 2 + 1.25rem);
  right: 0;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.25s, visibility 0.25s;
}
</style>
