import { inject, type Ref } from 'vue'
import { useData } from './data'
import { onMounted } from 'vue'

export interface UseDarkOptions {
  triggerPrint: boolean
}

export interface UseDark {
  isDark: Ref<boolean>
  toggleAppearance: () => void
}

export function useDark(options?: UseDarkOptions): UseDark {
  const { isDark } = useData()
  const toggleAppearance = inject('toggle-appearance', () => {
    isDark.value = !isDark.value
  })
  let previousPreferred = isDark.value
  let isPrinting = false

  // FIXME it will remain light when preferring dark mode after printing.
  if (options?.triggerPrint) {
    onMounted(() => {
      window.addEventListener('beforeprint', () => {
        if (isPrinting) return
        isPrinting = true
        previousPreferred = isDark.value
        isDark.value = false
      })
      window.addEventListener('afterprint', () => {
        isPrinting = false
        isDark.value = previousPreferred
      })
    })
  }
  return { isDark, toggleAppearance }
}
