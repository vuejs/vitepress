import { onUnmounted, readonly, type Ref, ref, watch } from 'vue'
import { inBrowser } from '../../shared'

interface UseFlyoutOptions {
  el: Ref<HTMLElement | undefined>
  onFocus?(): void
  onBlur?(): void
}

export const focusedElement = ref<HTMLElement>()

let active = false
let listeners = 0

export function useFlyout(options: UseFlyoutOptions) {
  const focus = ref(false)

  if (inBrowser) {
    !active && activateFocusTracking()

    listeners++

    const unwatch = watch(focusedElement, (el) => {
      if (el === options.el.value || options.el.value?.contains(el!)) {
        focus.value = true
        options.onFocus?.()
      } else {
        focus.value = false
        options.onBlur?.()
      }
    })

    onUnmounted(() => {
      unwatch()

      listeners--

      if (!listeners) {
        deactivateFocusTracking()
      }
    })
  }

  return readonly(focus)
}

function activateFocusTracking() {
  document.addEventListener('focusin', handleFocusIn)
  active = true
  focusedElement.value = document.activeElement as HTMLElement
}

function deactivateFocusTracking() {
  document.removeEventListener('focusin', handleFocusIn)
}

function handleFocusIn() {
  focusedElement.value = document.activeElement as HTMLElement
}
