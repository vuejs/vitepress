// dev-only: alt+click on rendered markdown content jumps the editor to the
// source location carried by the `data-v-inspector` attributes (see the
// sourceAttrs markdown plugin), through the dev server's built-in
// `/__open-in-editor` endpoint. Needs no plugins — with the Vue DevTools
// component inspector active, its own overlay takes over instead.

const ATTR = 'data-v-inspector'

export function setupOpenInEditor(): void {
  let target: HTMLElement | undefined
  let previousOutline = ''

  const clear = () => {
    if (target) {
      target.style.outline = previousOutline
      target = undefined
    }
  }

  const find = (el: EventTarget | null) =>
    el instanceof Element ? el.closest<HTMLElement>(`[${ATTR}]`) : null

  window.addEventListener('mousemove', (e) => {
    if (!e.altKey) return clear()
    const el = find(e.target)
    if (el === target) return
    clear()
    if (el) {
      target = el
      previousOutline = el.style.outline
      el.style.outline = '1px solid var(--vp-c-brand-1, #3451b2)'
    }
  })
  window.addEventListener('keyup', (e) => {
    if (e.key === 'Alt') clear()
  })
  window.addEventListener('blur', clear)

  window.addEventListener(
    'click',
    (e) => {
      if (!e.altKey) return
      // the vue devtools inspector overlay handles clicks itself while active
      if ((window as any).__VUE_INSPECTOR__?.enabled) return
      const loc = find(e.target)?.getAttribute(ATTR)
      if (!loc) return
      e.preventDefault()
      e.stopPropagation()
      clear()
      fetch(
        `${import.meta.env.BASE_URL}__open-in-editor?file=${encodeURIComponent(loc)}`
      )
    },
    true
  )
}
