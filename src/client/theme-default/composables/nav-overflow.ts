import { useMediaQuery } from '@vueuse/core'
import { inBrowser } from 'vitepress'
import {
  inject,
  onScopeDispose,
  provide,
  reactive,
  toValue,
  watch,
  type InjectionKey,
  type MaybeRefOrGetter
} from 'vue'

/**
 * Priority+ overflow for the navbar (#1271, #2842).
 *
 * Collapse order under space pressure: social links → appearance switch →
 * translations → menu items right-to-left. Collapsed units move into the
 * `⋯` flyout (VPNavBarExtra) instead of being clipped, so nothing ever
 * becomes unreachable.
 *
 * Collapsed units stay mounted but hidden (visibility: hidden + absolute,
 * which also removes them from the a11y tree and tab order), so their
 * natural widths remain measurable and observed — re-expanding never works
 * from stale data.
 */

export const navClusterUnits = [
  'translations',
  'appearance',
  'socialLinks'
] as const

export type NavClusterUnit = (typeof navClusterUnits)[number]

export interface NavFitInput {
  /** widths of the top-level menu items, in nav order (px) */
  itemWidths: number[]
  /** cluster unit widths; null = the unit isn't configured on this site */
  translations: number | null
  appearance: number | null
  socialLinks: number | null
  /** px available to all collapsible units */
  available: number
  /** px the `⋯` button occupies once anything is collapsed */
  extraWidth: number
}

export interface NavFitResult {
  /** number of menu items that stay in the bar (Infinity = all) */
  visibleItemCount: number
  translations: boolean
  appearance: boolean
  socialLinks: boolean
}

const allVisible: NavFitResult = {
  visibleItemCount: Infinity,
  translations: true,
  appearance: true,
  socialLinks: true
}

export function computeNavFit(input: NavFitInput): NavFitResult {
  const { itemWidths, available, extraWidth } = input

  const itemsTotal = itemWidths.reduce((sum, w) => sum + w, 0)
  const clusterTotal =
    (input.translations ?? 0) +
    (input.appearance ?? 0) +
    (input.socialLinks ?? 0)

  if (itemsTotal + clusterTotal <= available) return allVisible

  // something must collapse, so the `⋯` button needs room too
  const budget = available - extraWidth

  if (itemsTotal > budget) {
    // even the menu alone doesn't fit — the whole cluster collapses and the
    // menu keeps a contiguous prefix so the bar never shows a gap
    // (units that aren't configured stay `true`: there is nothing to collapse)
    let used = 0
    let visibleItemCount = 0
    for (const width of itemWidths) {
      if (used + width > budget) break
      used += width
      visibleItemCount++
    }
    return {
      visibleItemCount,
      translations: input.translations == null,
      appearance: input.appearance == null,
      socialLinks: input.socialLinks == null
    }
  }

  // menu fits in full; collapse the cluster in reverse keep-priority
  // (translations is kept longest, social links go first) — once a unit
  // collapses, everything after it in keep order collapses too
  const result = { ...allVisible }
  let used = itemsTotal
  let dropRest = false

  for (const unit of navClusterUnits) {
    const width = input[unit]
    if (width == null) continue
    if (dropRest || used + width > budget) {
      dropRest = true
      result[unit] = false
    } else {
      used += width
    }
  }

  return result
}

/** headroom against sub-pixel rounding and the inter-unit dividers */
const SLACK = 24

/** used until the real `⋯` button has been measured once */
const EXTRA_WIDTH_ESTIMATE = 48

export interface NavOverflow {
  /** reactive collapse state, all-visible during SSR and below 48rem */
  state: NavFitResult
  /** true when anything is collapsed into the `⋯` menu */
  hasCollapsed: () => boolean
  setContainerEl(el: HTMLElement | null): void
  setMenuEl(el: HTMLElement | null): void
  setExtraEl(el: HTMLElement | null): void
  setItemEl(index: number, el: HTMLElement | null): void
  setClusterEl(unit: NavClusterUnit, el: HTMLElement | null): void
}

const navOverflowKey: InjectionKey<NavOverflow> = Symbol('nav-overflow')

export function useNavOverflow(): NavOverflow | null {
  return inject(navOverflowKey, null)
}

export function provideNavOverflow(options: {
  /** stringified nav config — collapse state resets when it changes */
  itemsKey: MaybeRefOrGetter<string>
}): NavOverflow {
  const state = reactive<NavFitResult>({ ...allVisible })

  const itemEls = new Map<number, HTMLElement>()
  const clusterEls = new Map<NavClusterUnit, HTMLElement>()
  let containerEl: HTMLElement | null = null
  let menuEl: HTMLElement | null = null
  let extraEl: HTMLElement | null = null
  let extraWidth = EXTRA_WIDTH_ESTIMATE

  let observer: ResizeObserver | null = null
  const observed = new Set<HTMLElement>()
  let scheduled = false

  function observe(el: HTMLElement | null) {
    // instanceof also guards against fragment roots handing over a comment
    // node via $el — better to skip a unit than to crash the bar
    if (!inBrowser || !(el instanceof Element) || observed.has(el)) return
    observed.add(el)
    ;(observer ??= new ResizeObserver(schedule)).observe(el)
  }

  function schedule() {
    if (!inBrowser || scheduled) return
    scheduled = true
    requestAnimationFrame(() => {
      scheduled = false
      recompute()
    })
  }

  const controller: NavOverflow = {
    state,
    hasCollapsed: () =>
      state.visibleItemCount !== Infinity ||
      !state.translations ||
      !state.appearance ||
      !state.socialLinks,
    setContainerEl(el) {
      containerEl = el
      observe(el)
      schedule()
    },
    setMenuEl(el) {
      menuEl = el
      observe(el)
      schedule()
    },
    setExtraEl(el) {
      extraEl = el
      observe(el)
      schedule()
    },
    setItemEl(index, el) {
      el ? itemEls.set(index, el) : itemEls.delete(index)
      // container and menu boxes don't resize when item content changes
      // (the menu is flex-grown), so the items themselves are observed
      observe(el)
      schedule()
    },
    setClusterEl(unit, el) {
      el ? clusterEls.set(unit, el) : clusterEls.delete(unit)
      observe(el)
      schedule()
    }
  }

  provide(navOverflowKey, controller)

  if (!inBrowser) return controller

  // below tablet size the hamburger + screen own navigation and the bar only
  // shows title/search/hamburger, so the engine idles in the all-visible state
  const isEngineActive = useMediaQuery('(min-width: 48rem)')

  // natural width even while the unit is collapsed (clamped by max-width)
  function measureUnit(el: HTMLElement) {
    return Math.max(el.offsetWidth, el.scrollWidth)
  }

  function recompute() {
    if (!isEngineActive.value) return applyResult(allVisible)
    if (!containerEl) return

    if (extraEl && extraEl.offsetWidth > 0) extraWidth = extraEl.offsetWidth

    // everything in the row that isn't a collapsible unit (search, slots,
    // the hamburger…) is measured live and treated as fixed occupancy
    let fixed = 0
    for (const child of Array.from(containerEl.children)) {
      if (!(child instanceof HTMLElement)) continue
      if (child === menuEl || child === extraEl) continue
      let isCluster = false
      for (const el of clusterEls.values()) {
        if (el === child) {
          isCluster = true
          break
        }
      }
      if (isCluster) continue
      fixed += child.offsetWidth
    }

    const itemWidths: number[] = []
    for (let i = 0; i < itemEls.size; i++) {
      const el = itemEls.get(i)
      // a hole means not every item has registered yet — wait for the next
      // pass instead of collapsing on partial data
      if (!el) return
      itemWidths.push(measureUnit(el))
    }

    const clusterWidth = (unit: NavClusterUnit) => {
      const el = clusterEls.get(unit)
      return el ? measureUnit(el) : null
    }

    applyResult(
      computeNavFit({
        itemWidths,
        translations: clusterWidth('translations'),
        appearance: clusterWidth('appearance'),
        socialLinks: clusterWidth('socialLinks'),
        available: containerEl.clientWidth - fixed - SLACK,
        extraWidth
      })
    )
  }

  function applyResult(result: NavFitResult) {
    if (state.visibleItemCount !== result.visibleItemCount)
      state.visibleItemCount = result.visibleItemCount
    for (const unit of navClusterUnits) {
      if (state[unit] !== result[unit]) state[unit] = result[unit]
    }
  }

  watch(isEngineActive, schedule)

  watch(() => toValue(options.itemsKey), schedule)

  if (document.fonts?.ready) {
    // a clamped collapsed unit keeps its box size when the font changes, so
    // the ResizeObserver alone can miss late font swaps
    document.fonts.ready.then(schedule).catch(() => {})
  }

  onScopeDispose(() => {
    observer?.disconnect()
    observer = null
    observed.clear()
  })

  return controller
}
