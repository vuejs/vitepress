import { useMediaQuery } from '@vueuse/core'
import type { DefaultTheme } from 'vitepress/theme'
import { onMounted, onUnmounted, onUpdated, type Ref } from 'vue'
import { throttleAndDebounce } from '../support/utils'

const ignoreRE = /\b(?:VPBadge|header-anchor|footnote-ref|ignore-header)\b/

// cached list of anchor elements from resolveHeaders
const resolvedHeaders: { element: HTMLHeadElement; link: string }[] = []

export function resolveTitle(theme: DefaultTheme.Config): string {
  return (
    (typeof theme.outline === 'object' &&
      !Array.isArray(theme.outline) &&
      theme.outline.label) ||
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

export function useActiveAnchor(
  container: Ref<HTMLElement>,
  marker: Ref<HTMLElement>
): void {
  const isAsideVisible = useMediaQuery('(min-width: 80rem)')

  const onScroll = throttleAndDebounce(setActiveLink, 100)

  let prevActiveLink: HTMLAnchorElement | null = null
  let ignoreScrollOnce: boolean = false

  onMounted(() => {
    requestAnimationFrame(setActiveLink)
    window.addEventListener('scroll', onScroll)
    container.value.addEventListener('click', onClick)
  })

  onUpdated(() => {
    // sidebar update means a route change
    activateLink(location.hash)
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', onScroll)
  })

  function onClick(e: MouseEvent) {
    if (!isAsideVisible.value) {
      return
    }

    const hash =
      e.target instanceof Element ? e.target.closest('a')?.hash : null

    if (hash) {
      ignoreScrollOnce = true
      activateLink(hash)
    }
  }

  function setActiveLink() {
    if (!isAsideVisible.value) {
      return
    }

    if (ignoreScrollOnce) {
      ignoreScrollOnce = false
      return
    }

    const scrollY = window.scrollY
    const innerHeight = window.innerHeight
    const offsetHeight = document.body.offsetHeight
    const isBottom = scrollY + innerHeight - offsetHeight >= 0

    // resolvedHeaders may be repositioned, hidden or fix positioned
    const headers = resolvedHeaders
      .map(({ element, link }) => ({
        link,
        top: getAbsoluteTop(element),
        scrollMarginTop:
          Number.parseFloat(getComputedStyle(element).scrollMarginTop) || 0
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
    for (const { link, top, scrollMarginTop } of headers) {
      if (top > scrollY + scrollMarginTop + 4) {
        break
      }
      activeLink = link
    }
    activateLink(activeLink)
  }

  function activateLink(hash: string | null) {
    const activeLink =
      hash != null
        ? container.value.querySelector<HTMLAnchorElement>(
            `a[href$="${decodeURIComponent(hash)}"]`
          )
        : null

    if (activeLink === prevActiveLink) return

    prevActiveLink?.classList.remove('active')
    prevActiveLink = activeLink

    if (activeLink) {
      activeLink.classList.add('active')
      // the links' offsetParent (.root) sits below the outline title while the
      // marker is offset from .content, so re-align their origins
      marker.value.style.top =
        activeLink.offsetTop +
        ((activeLink.offsetParent as HTMLElement)?.offsetTop ?? 0) +
        (activeLink.offsetHeight - marker.value.offsetHeight) / 2 +
        'px'
      marker.value.style.opacity = '1'
      activeLink.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    } else {
      marker.value.style.top = ''
      marker.value.style.opacity = '0'
    }
  }
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
    DefaultTheme.OutlineItem | { level: number; shouldIgnore: true }
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
