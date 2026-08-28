import {
  computed,
  onMounted,
  toValue,
  useSSRContext,
  watchPostEffect,
  type ComputedRef,
  type MaybeRefOrGetter
} from 'vue'

import { parseIconName, type SSGContext } from '../../shared'
import { withBase } from '../utils'

/**
 * Resolves an icon name (`collection:name`, e.g. `simple-icons:github`) to
 * its `vpi-<collection>-<name>` class. During SSR the name is registered so
 * the build emits its CSS rule; in dev the SVG is served on demand and
 * applied to `el` inline.
 */
export function useIcon(
  icon: MaybeRefOrGetter<string | { svg: string } | undefined>,
  el?: MaybeRefOrGetter<HTMLElement | null>
): ComputedRef<string | undefined> {
  const parsed = computed(() => {
    const value = toValue(icon)
    return typeof value === 'string' ? parseIconName(value) : null
  })

  const iconClass = computed(() =>
    parsed.value
      ? `vpi-${parsed.value.collection}-${parsed.value.icon}`
      : undefined
  )

  if (import.meta.env.SSR) {
    const ctx = useSSRContext<SSGContext>()
    const value = toValue(icon)
    // unparseable names are registered too — the build warns about them
    if (typeof value === 'string') ctx?.vpIcons.add(value)
  } else if (import.meta.env.DEV) {
    // dev has no generated stylesheet — the icon is always fetched from the
    // dev server, re-resolved when the name changes
    let applied: string | undefined
    onMounted(() => {
      watchPostEffect(() => {
        const span = toValue(el)
        if (!span) return
        const name = parsed.value
        if (!name) {
          if (applied) {
            span.style.removeProperty('--icon')
            applied = undefined
          }
          return
        }
        const key = `${name.collection}/${name.icon}`
        if (applied === key) return
        applied = key
        span.style.setProperty(
          '--icon',
          `url('${withBase(`/_vpi/${name.collection}/${name.icon}.svg`)}')`
        )
        // inline the mask setup for themes without the default icon rules
        const styles = getComputedStyle(span)
        if ((styles.maskImage || styles.webkitMaskImage) === 'none') {
          Object.assign(span.style, {
            display: 'inline-block',
            width: '1em',
            height: '1em',
            mask: 'var(--icon) no-repeat',
            webkitMask: 'var(--icon) no-repeat',
            maskSize: '100% 100%',
            webkitMaskSize: '100% 100%',
            backgroundColor: 'currentColor'
          })
        }
      })
    })
  }

  return iconClass
}
