import { getScrollOffset } from 'vitepress'
import type { DefaultTheme } from 'vitepress/theme'
import { onMounted, onUnmounted, onUpdated, type Ref, watch } from 'vue'
import { throttleAndDebounce } from '../support/utils'
import { useAside } from './aside'

const ignoreRE = /\b(?:VPBadge|header-anchor|footnote-ref|ignore-header)\b/

// cached list of anchor elements from resolveHeaders
const resolvedHeaders: { element: HTMLHeadElement; link: string }[] = []

export function resolveTitle(theme: DefaultTheme.Config): string {
  return (
    (typeof theme.outline === 'object' &&
      !Array.isArray(theme.outline) &&
      theme.outline.label) ||
    theme.outlineTitle ||
    'On this page'
  )
}

export function getHeaders(
  range: DefaultTheme.Config['outline']
): DefaultTheme.OutlineItem[] {
  const headers = [
    ...document.querySelectorAll(
      '.VPDoc h1, .VPDoc h2, .VPDoc h3, .VPDoc h4, .VPDoc h5, .VPDoc h6'
    )
  ]
    .filter((el) => el.id && el.hasChildNodes())
    .map((el) => {
      const level = Number(el.tagName[1])
      return {
        element: el as HTMLHeadElement,
        title: serializeHeader(el),
        link: '#' + el.id,
        level
      }
    })

  return resolveHeaders(headers, range)
}

function serializeHeader(h: Element): string {
  let ret = ''
  for (const node of h.childNodes) {
    if (node.nodeType === 1) {
      if (ignoreRE.test((node as Element).className)) continue
      ret += node.textContent
    } else if (node.nodeType === 3) {
      ret += node.textContent
    }
  }
  return ret.trim()
}

export function resolveHeaders(
  headers: DefaultTheme.OutlineItem[],
  range?: DefaultTheme.Config['outline']
): DefaultTheme.OutlineItem[] {
  if (range === false) {
    return []
  }

  const levelsRange =
    (typeof range === 'object' && !Array.isArray(range)
      ? range.level
      : range) || 2

  const [high, low]: [number, number] =
    typeof levelsRange === 'number'
      ? [levelsRange, levelsRange]
      : levelsRange === 'deep'
        ? [2, 6]
        : levelsRange

  return buildTree(headers, high, low)
}

function useBaseActiveAnchor(
  container: Ref<HTMLElement | undefined>,
  marker: Ref<HTMLElement | undefined>,
  isEnabled: Ref<boolean>,
  options: {
    topOffset: number;
    defaultTop: string;
    onEnable?: () => void;
  },
  prevActiveLinkRef?: { current: HTMLAnchorElement | null }
): {
  setActiveLink: () => void;
  activateLink: (hash: string | null) => void;
} {
  let prevActiveLink: HTMLAnchorElement | null = null

  function setActiveLink() {
    if (!isEnabled.value || !container.value || !marker.value) {
      return
    }

    const scrollY = window.scrollY
    const innerHeight = window.innerHeight
    const offsetHeight = document.body.offsetHeight
    const isBottom = Math.abs(scrollY + innerHeight - offsetHeight) < 1

    // resolvedHeaders may be repositioned, hidden or fix positioned
    const headers = resolvedHeaders
      .map(({ element, link }) => ({
        link,
        top: getAbsoluteTop(element)
      }))
      .filter(({ top }) => !Number.isNaN(top))
      .sort((a, b) => a.top - b.top)

    // no headers available for active link
    if (!headers.length) {
      activateLink(null)
      return
    }

    // page top
    if (scrollY < 1) {
      activateLink(null)
      return
    }

    // page bottom - highlight last link
    if (isBottom) {
      activateLink(headers[headers.length - 1].link)
      return
    }

    // find the last header above the top of viewport
    let activeLink: string | null = null
    for (const { link, top } of headers) {
      if (top > scrollY + getScrollOffset() + 4) {
        break
      }
      activeLink = link
    }
    activateLink(activeLink)
  }

  function activateLink(hash: string | null) {
    if (!container.value || !marker.value) {
      return
    }

    if (prevActiveLink) {
      prevActiveLink.classList.remove('active')
    }

    if (hash == null) {
      prevActiveLink = null
      marker.value.style.top = options.defaultTop
      marker.value.style.opacity = '0'
    } else {
      prevActiveLink = container.value.querySelector(
        `a[href="${decodeURIComponent(hash)}"]`
      )

      if (prevActiveLink) {
        prevActiveLink.classList.add('active')
        marker.value.style.top = prevActiveLink.offsetTop + options.topOffset + 'px'
        marker.value.style.opacity = '1'
      } else {
        marker.value.style.opacity = '0'
      }
    }

    // Update external ref if provided
    if (prevActiveLinkRef) {
      prevActiveLinkRef.current = prevActiveLink
    }
  }

  return {
    setActiveLink,
    activateLink
  }
}

export function useActiveAnchor(
  container: Ref<HTMLElement>,
  marker: Ref<HTMLElement>
): void {
  const { isAsideEnabled } = useAside()

  const { setActiveLink, activateLink } = useBaseActiveAnchor(
    container,
    marker,
    isAsideEnabled,
    {
      topOffset: 39,
      defaultTop: '33px'
    }
  )

  const onScroll = throttleAndDebounce(setActiveLink, 100)

  onMounted(() => {
    requestAnimationFrame(setActiveLink)
    window.addEventListener('scroll', onScroll)
  })

  onUpdated(() => {
    // sidebar update means a route change
    activateLink(location.hash)
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', onScroll)
  })
}

export function useFloatActiveAnchor(
  container: Ref<HTMLElement | undefined>,
  marker: Ref<HTMLElement | undefined>,
  isEnabled: Ref<boolean>
): void {
  // Use a ref to track prevActiveLink so it can be shared between scopes
  const prevActiveLinkRef = { current: null as HTMLAnchorElement | null }

  const { setActiveLink, activateLink } = useBaseActiveAnchor(
    container,
    marker,
    isEnabled,
    {
      topOffset: 6,
      defaultTop: '57px'
    },
    prevActiveLinkRef
  )

  const onScroll = throttleAndDebounce(setActiveLink, 100)

  watch(isEnabled, (newValue, oldValue) => {
    if (newValue && !oldValue) {
      requestAnimationFrame(() => {
        setActiveLink()
        if (prevActiveLinkRef.current && container.value) {
          container.value.scrollTop = prevActiveLinkRef.current.offsetTop - 8
        }
      })
      window.addEventListener('scroll', onScroll)
    } else if (!newValue && oldValue) {
      window.removeEventListener('scroll', onScroll)
    }

  })
  onUpdated(() => {
    // Update active link on content update
    if (isEnabled.value) {
      activateLink(location.hash)
    }
  })
}

function getAbsoluteTop(element: HTMLElement): number {
  let offsetTop = 0
  while (element !== document.body) {
    if (element === null) {
      // child element is:
      // - not attached to the DOM (display: none)
      // - set to fixed position (not scrollable)
      // - body or html element (null offsetParent)
      return NaN
    }
    offsetTop += element.offsetTop
    element = element.offsetParent as HTMLElement
  }
  return offsetTop
}

function buildTree(
  data: DefaultTheme.OutlineItem[],
  min: number,
  max: number
): DefaultTheme.OutlineItem[] {
  resolvedHeaders.length = 0

  const result: DefaultTheme.OutlineItem[] = []
  const stack: (
    | DefaultTheme.OutlineItem
    | { level: number; shouldIgnore: true }
  )[] = []

  data.forEach((item) => {
    const node = { ...item, children: [] }
    let parent = stack[stack.length - 1]

    while (parent && parent.level >= node.level) {
      stack.pop()
      parent = stack[stack.length - 1]
    }

    if (
      node.element.classList.contains('ignore-header') ||
      (parent && 'shouldIgnore' in parent)
    ) {
      stack.push({ level: node.level, shouldIgnore: true })
      return
    }

    if (node.level > max || node.level < min) return
    resolvedHeaders.push({ element: node.element, link: node.link })

    if (parent) parent.children!.push(node)
    else result.push(node)

    stack.push(node)
  })

  return result
}
