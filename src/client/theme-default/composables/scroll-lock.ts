import { inBrowser } from 'vitepress'
import {
  computed,
  onScopeDispose,
  shallowRef,
  type WritableComputedRef
} from 'vue'

const isIOS =
  inBrowser &&
  (/iP(?:ad|hone|od)/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1))

const scrollKeys = new Set([
  ' ',
  'PageUp',
  'PageDown',
  'Home',
  'End',
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight'
])

const listenerOptions = { capture: true, passive: false } as const

function isScrollable(target: EventTarget | null): boolean {
  let el = target instanceof Element ? target : null
  while (el && el !== document.body) {
    const { overflowX, overflowY } = getComputedStyle(el)
    if (
      ((overflowY === 'auto' || overflowY === 'scroll') &&
        el.scrollHeight > el.clientHeight) ||
      ((overflowX === 'auto' || overflowX === 'scroll') &&
        el.scrollWidth > el.clientWidth)
    ) {
      return true
    }
    el = el.parentElement
  }
  return false
}

function blockScroll(e: Event) {
  if ('touches' in e && (e as TouchEvent).touches.length > 1) return
  if (!isScrollable(e.target)) e.preventDefault()
}

function blockScrollKeys(e: KeyboardEvent) {
  if (e.metaKey || e.ctrlKey || e.altKey || !scrollKeys.has(e.key)) return
  const el = e.target
  if (
    el instanceof HTMLElement &&
    (el.isContentEditable || el.matches('input, textarea, select'))
  ) {
    return
  }
  blockScroll(e)
}

// all instances lock the same element, so the style juggling is refcounted
let overflowLockCount = 0
let eventLockCount = 0
let initialOverflow: string | undefined
let initialGutter: string | undefined

function lockOverflow() {
  if (++overflowLockCount > 1) return
  const html = document.documentElement
  if (!getComputedStyle(html).scrollbarGutter.includes('stable')) {
    initialGutter = html.style.scrollbarGutter
    html.style.scrollbarGutter = 'stable'
  }
  initialOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  if (isIOS) {
    document.addEventListener('touchmove', blockScroll, listenerOptions)
  }
}

function unlockOverflow() {
  if (--overflowLockCount > 0) return
  if (isIOS) {
    document.removeEventListener('touchmove', blockScroll, listenerOptions)
  }
  document.body.style.overflow = initialOverflow ?? ''
  if (initialGutter !== undefined) {
    document.documentElement.style.scrollbarGutter = initialGutter
  }
  initialOverflow = initialGutter = undefined
}

function lockEvents() {
  if (++eventLockCount > 1) return
  document.addEventListener('wheel', blockScroll, listenerOptions)
  document.addEventListener('touchmove', blockScroll, listenerOptions)
  document.addEventListener('keydown', blockScrollKeys, listenerOptions)
}

function unlockEvents() {
  if (--eventLockCount > 0) return
  document.removeEventListener('wheel', blockScroll, listenerOptions)
  document.removeEventListener('touchmove', blockScroll, listenerOptions)
  document.removeEventListener('keydown', blockScrollKeys, listenerOptions)
}

/**
 * Locks page scrolling behind an overlay.
 *
 * Prefer `scrollbar-gutter: stable` + `overflow: hidden` so layout width
 * stays stable when the scrollbar is hidden. If unsupported, fall back to
 * blocking scroll events while still allowing events inside scrollable
 * elements.
 */
export function useBodyScrollLock(): WritableComputedRef<boolean> {
  const isLocked = shallowRef(false)
  let useEvents = false

  function lock() {
    if (isLocked.value) return
    useEvents =
      window.innerWidth > document.documentElement.clientWidth &&
      !CSS.supports('scrollbar-gutter', 'stable')
    useEvents ? lockEvents() : lockOverflow()
    isLocked.value = true
  }

  function unlock() {
    if (!isLocked.value) return
    useEvents ? unlockEvents() : unlockOverflow()
    isLocked.value = false
  }

  onScopeDispose(unlock)

  return computed({
    get: () => isLocked.value,
    set: (value) => (value ? lock() : unlock())
  })
}
