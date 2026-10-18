import { inBrowser, onContentUpdated } from 'vitepress'

// Zoom and pan for the diagrams `markdown.mermaid` renders at build time - a
// port of the zoom of pele (https://pele.run, MIT), whose renderer never
// ships to the browser. A diagram is enlarged within its own box, by pinching,
// by the wheel with Ctrl or ⌘ held, by dragging, by a double click, from the
// keyboard, and with the buttons the markdown renderer emits: the box shows
// less of the drawing, larger, so nothing around it moves.

interface Size {
  width: number
  height: number
}

interface Point {
  x: number
  y: number
}

interface Options {
  // whether a diagram that fits its container can be enlarged as well
  always?: boolean
  // the most a diagram is enlarged, as a multiple of its natural size
  maxScale?: number
}

interface Instance {
  destroy(): void
}

const STEP = 1.25
const PAN = 48

export function useMermaidZoom() {
  if (!inBrowser) return

  const active = new Map<HTMLElement, Instance>()

  onContentUpdated(() => {
    for (const [el, instance] of active) {
      if (!el.isConnected) {
        instance.destroy()
        active.delete(el)
      }
    }
    document
      .querySelectorAll<HTMLElement>('.vp-mermaid[data-zoom]')
      .forEach((el) => {
        if (active.has(el)) return
        active.set(
          el,
          enableZoom(el, {
            always: el.dataset.zoom === 'always',
            maxScale: Number(el.dataset.zoomMax) || undefined
          })
        )
      })
  })
}

// The part of the drawing that shows in a box at a scale. A drawing larger
// than the view stops at its own edges; a smaller one stays whole inside it.
function frame(
  natural: Size,
  box: Size,
  scale: number,
  x: number,
  y: number
): { x: number; y: number; width: number; height: number } {
  const width = box.width / scale
  const height = box.height / scale
  const within = (at: number, view: number, whole: number): number =>
    view >= whole
      ? Math.min(Math.max(at, whole - view), 0)
      : Math.min(Math.max(at, 0), whole - view)
  return {
    x: within(x, width, natural.width),
    y: within(y, height, natural.height),
    width,
    height
  }
}

function enableZoom(element: HTMLElement, options: Options): Instance {
  const svg = element.querySelector<SVGSVGElement>(':scope > svg')
  const bar = element.querySelector<HTMLElement>(
    ':scope > .vp-mermaid-controls'
  )
  if (!svg) return { destroy() {} }

  const buttons = {
    zoomIn: bar?.querySelector<HTMLButtonElement>('.zoom-in'),
    zoomOut: bar?.querySelector<HTMLButtonElement>('.zoom-out'),
    reset: bar?.querySelector<HTMLButtonElement>('.zoom-reset')
  }

  const natural: Size = {
    width: Number(svg.getAttribute('width')) || 0,
    height: Number(svg.getAttribute('height')) || 0
  }
  // the size at the scale that fits, where the drawing rests
  const rest: Size = { width: 0, height: 0 }
  // the box an enlarged drawing is shown in: the room its element already
  // has, padding and all, where that is more than the drawing takes at rest
  let box: Size = { width: 0, height: 0 }
  let roomy = false
  let bleed = ''
  const restStyle = {
    width: svg.style.width,
    height: svg.style.height,
    maxWidth: svg.style.maxWidth,
    margin: svg.style.margin,
    display: svg.style.display
  }
  // the scale shown, or 0 while the drawing rests at the size that fits
  let scale = 0
  let x = 0
  let y = 0

  const fit = (): number =>
    natural.width > 0 && rest.width > 0 ? rest.width / natural.width : 1
  const most = (): number => Math.max(fit(), options.maxScale ?? 3)
  const zoomable = (): boolean =>
    natural.width > 0 && (options.always === true || fit() < 0.999)

  const measure = (): void => {
    if (scale !== 0) return
    const at = svg.getBoundingClientRect()
    rest.width = at.width
    rest.height = at.height
    box = {
      width: Math.max(rest.width, element.clientWidth),
      height: Math.max(rest.height, element.clientHeight)
    }
    roomy = box.width > rest.width + 1 || box.height > rest.height + 1
    if (!roomy) box = { ...rest }
    // padding keeps a drawing at rest off the element's edges; an enlarged
    // one is a view, which reaches them: margins of the opposite size carry
    // it over the padding
    const style = getComputedStyle(element)
    bleed = ['top', 'right', 'bottom', 'left']
      .map(
        (side) =>
          `${-(parseFloat(style.getPropertyValue(`padding-${side}`)) || 0)}px`
      )
      .join(' ')
  }

  const offer = (): void => {
    // the theme keeps the controls of an enlarged diagram in view
    element.classList.toggle('zoomed', scale !== 0)
    if (!bar) return
    const can = zoomable()
    bar.hidden = !can
    if (buttons.zoomIn) {
      buttons.zoomIn.disabled = (scale || fit()) >= most() * 0.999
    }
    if (buttons.zoomOut) buttons.zoomOut.disabled = scale === 0
    if (buttons.reset) buttons.reset.hidden = scale === 0
  }
  const ours = (event: Event): boolean =>
    !!bar && event.target instanceof Node && bar.contains(event.target)

  const settle = (): void => {
    scale = 0
    svg.setAttribute('viewBox', `0 0 ${natural.width} ${natural.height}`)
    Object.assign(svg.style, restStyle, { cursor: '', userSelect: '' })
    measure()
    const can = zoomable()
    // one finger still scrolls the page; two are left to the drawing
    svg.style.touchAction = can ? 'pan-y' : ''
    if (can) svg.setAttribute('tabindex', '0')
    else svg.removeAttribute('tabindex')
    take(can)
    offer()
  }

  // shows the drawing at a scale, keeping the point under (clientX, clientY)
  // where it is
  const show = (next: number, clientX?: number, clientY?: number): void => {
    if (scale === 0) measure()
    if (!zoomable()) return
    const from = scale || fit()
    const to = Math.min(Math.max(next, fit()), most())
    if (to <= fit() * 1.001) {
      settle()
      return
    }
    const before = svg.getBoundingClientRect()
    const atX = clientX ?? before.left + before.width / 2
    const atY = clientY ?? before.top + before.height / 2
    const pointX = (scale ? x : 0) + (atX - before.left) / from
    const pointY = (scale ? y : 0) + (atY - before.top) / from
    scale = to
    let after = before
    if (roomy) {
      svg.style.maxWidth = 'none'
      svg.style.margin = bleed
      svg.style.display = 'block'
      svg.style.width = `${box.width}px`
      svg.style.height = `${box.height}px`
      after = svg.getBoundingClientRect()
    }
    place(
      pointX - (atX - after.left) / scale,
      pointY - (atY - after.top) / scale
    )
    svg.style.cursor = 'grab'
    svg.style.userSelect = 'none'
    svg.style.touchAction = 'none'
    offer()
  }

  const place = (toX: number, toY: number): void => {
    const shown = frame(natural, box, scale, toX, toY)
    x = shown.x
    y = shown.y
    svg.setAttribute('viewBox', `${x} ${y} ${shown.width} ${shown.height}`)
  }

  const move = (dx: number, dy: number): void => {
    if (scale !== 0) place(x - dx / scale, y - dy / scale)
  }

  let watched = element.clientWidth + element.clientHeight
  const resized = (): void => {
    const size = element.clientWidth + element.clientHeight
    if (size === watched) return
    watched = size
    settle()
  }

  const pointers = new Map<number, Point>()
  let dragged = false
  let travelled = 0
  let pinch = 0

  const spread = (): { distance: number; x: number; y: number } => {
    const [a, b] = [...pointers.values()] as [Point, Point]
    return {
      distance: Math.hypot(a.x - b.x, a.y - b.y),
      x: (a.x + b.x) / 2,
      y: (a.y + b.y) / 2
    }
  }

  const onPointerDown = (event: PointerEvent): void => {
    if (
      !zoomable() ||
      ours(event) ||
      (event.pointerType === 'mouse' && event.button !== 0)
    ) {
      return
    }
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
    travelled = 0
    if (pointers.size === 2) pinch = spread().distance
    if (pointers.size === 2 || scale !== 0) {
      element.setPointerCapture?.(event.pointerId)
      svg.style.cursor = 'grabbing'
    }
  }

  const onPointerMove = (event: PointerEvent): void => {
    const last = pointers.get(event.pointerId)
    if (!last) return
    if (pointers.size === 2) {
      const before = spread()
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
      const now = spread()
      if (pinch > 0 && now.distance > 0) {
        show((scale || fit()) * (now.distance / before.distance), now.x, now.y)
      }
      move(now.x - before.x, now.y - before.y)
      dragged = true
      return
    }
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
    if (scale === 0) return
    travelled +=
      Math.abs(event.clientX - last.x) + Math.abs(event.clientY - last.y)
    if (travelled > 4) dragged = true
    move(event.clientX - last.x, event.clientY - last.y)
  }

  const onPointerUp = (event: PointerEvent): void => {
    if (!pointers.delete(event.pointerId)) return
    pinch = 0
    if (pointers.size === 0 && scale !== 0) svg.style.cursor = 'grab'
  }

  // a drag that ends over a link is not a click on it
  const onClick = (event: MouseEvent): void => {
    if (!dragged) return
    dragged = false
    event.preventDefault()
    event.stopPropagation()
  }

  const onWheel = (event: WheelEvent): void => {
    // without the key, the wheel is the page's; with it, the browser would
    // zoom the whole page
    if (!(event.ctrlKey || event.metaKey) || !zoomable()) return
    event.preventDefault()
    if (scale === 0) measure()
    // a notch of a mouse wheel is a hundred or more; a pinch on a trackpad
    // sends many small ones
    const turn = Math.min(Math.max(-event.deltaY, -24), 24)
    show((scale || fit()) * 2 ** (turn * 0.02), event.clientX, event.clientY)
  }

  const onDoubleClick = (event: MouseEvent): void => {
    if (!zoomable() || ours(event)) return
    event.preventDefault()
    if (scale !== 0) settle()
    else show(Math.max(1, fit() * 2), event.clientX, event.clientY)
  }

  const onKeyDown = (event: KeyboardEvent): void => {
    if (
      !zoomable() ||
      ours(event) ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey
    ) {
      return
    }
    const key = event.key
    if (key === '+' || key === '=') show((scale || fit()) * STEP)
    else if (key === '-') show((scale || fit()) / STEP)
    else if (scale === 0) return
    else if (key === '0' || key === 'Escape') settle()
    else if (key === 'ArrowLeft') move(PAN, 0)
    else if (key === 'ArrowRight') move(-PAN, 0)
    else if (key === 'ArrowUp') move(0, PAN)
    else if (key === 'ArrowDown') move(0, -PAN)
    else return
    event.preventDefault()
  }

  // Safari on a Mac reports a trackpad pinch this way and no other
  let gesture = 0
  const onGestureStart = (event: Event): void => {
    if (!zoomable()) return
    event.preventDefault()
    if (scale === 0) measure()
    gesture = scale || fit()
  }
  const onGestureChange = (event: Event): void => {
    if (gesture === 0) return
    event.preventDefault()
    const {
      scale: by,
      clientX,
      clientY
    } = event as Event & {
      scale: number
      clientX: number
      clientY: number
    }
    show(gesture * by, clientX, clientY)
  }
  const onGestureEnd = (): void => {
    gesture = 0
  }

  const actions = {
    zoomIn: () => show((scale || fit()) * STEP * STEP),
    zoomOut: () => show((scale || fit()) / (STEP * STEP)),
    reset: () => settle()
  }
  for (const name of ['zoomIn', 'zoomOut', 'reset'] as const) {
    buttons[name]?.addEventListener('click', actions[name])
  }

  const listeners: [string, EventListener, AddEventListenerOptions?][] = [
    ['pointerdown', onPointerDown as EventListener],
    ['pointermove', onPointerMove as EventListener],
    ['pointerup', onPointerUp as EventListener],
    ['pointercancel', onPointerUp as EventListener],
    ['click', onClick as EventListener, { capture: true }],
    ['dblclick', onDoubleClick as EventListener],
    ['keydown', onKeyDown as EventListener]
  ]
  for (const [type, listener, how] of listeners) {
    element.addEventListener(type, listener, how)
  }

  // taken only while the drawing can be enlarged: a wheel listener that may
  // stop the wheel makes the browser wait for the page's script before it
  // scrolls, so a drawing that fits adds none
  const gestures: [string, EventListener, AddEventListenerOptions][] = [
    ['wheel', onWheel as EventListener, { passive: false }],
    ['gesturestart', onGestureStart, { passive: false }],
    ['gesturechange', onGestureChange, { passive: false }],
    ['gestureend', onGestureEnd, { passive: false }]
  ]
  let taking = false
  function take(on: boolean): void {
    if (on === taking) return
    taking = on
    for (const [type, listener, how] of gestures) {
      if (on) element.addEventListener(type, listener, how)
      else element.removeEventListener(type, listener, how)
    }
    if (!on) gesture = 0
  }

  const observer =
    typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(resized)
      : undefined
  observer?.observe(element)

  settle()

  return {
    destroy() {
      settle()
      svg.style.touchAction = ''
      svg.removeAttribute('tabindex')
      if (bar) bar.hidden = true
      observer?.disconnect()
      take(false)
      for (const [type, listener, how] of listeners) {
        element.removeEventListener(type, listener, how)
      }
      for (const name of ['zoomIn', 'zoomOut', 'reset'] as const) {
        buttons[name]?.removeEventListener('click', actions[name])
      }
    }
  }
}
