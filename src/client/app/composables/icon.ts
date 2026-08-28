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
 * Renders an iconify icon through vitepress's icon pipeline: during SSR the
 * name is registered so the build emits its CSS rule; in dev the icon is
 * resolved from locally installed collections, without network access.
 *
 * Accepts a fully qualified `collection:name` for any `@iconify-json/*`
 * collection in the project's dependencies (e.g. `simple-icons:github`).
 * Returns the class to render (`vpi-<collection>-<name>`); pass the
 * template ref of the element carrying it so dev can apply the on-demand
 * fallback.
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
    // dev has no generated stylesheet, so a `vpi-<collection>-<name>` class
    // never has a rule — the icon always comes from the dev server, tracked
    // per name so a reactive icon prop re-resolves
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
          `url('${withBase(`/@vpicons/${name.collection}/${name.icon}.svg`)}')`
        )
        // a theme without the default theme's icon rules gets the mask
        // machinery inline, so dev works before any styling exists
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
