import { onUnmounted, watch } from 'vue'
import { onContentUpdated } from 'vitepress'
import { throttleAndDebounce } from '../support/utils'
import { useAside } from '../composables/aside'

import { type Ref } from 'vue'
import { type DefaultTheme } from 'vitepress/theme'
import { type Header } from '../../shared'

const PAGE_OFFSET = 48

export type MenuItem = Omit<Header, 'slug' | 'children'> & {
  children?: MenuItem[]
}

export function resolveTitle(theme: DefaultTheme.Config) {
  return (
    (typeof theme.outline === 'object' &&
      !Array.isArray(theme.outline) &&
      theme.outline.label) ||
    theme.outlineTitle ||
    'On this page'
  )
}

export function getHeaders(range: DefaultTheme.Config['outline']) {
  const headers = [...document.querySelectorAll('.VPDoc h2,h3,h4,h5,h6')]
    .filter((el) => el.id && el.hasChildNodes())
    .map((el) => {
      const level = Number(el.tagName[1])
      return {
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
      if (
        (node as Element).classList.contains('VPBadge') ||
        (node as Element).classList.contains('header-anchor')
      ) {
        continue
      }
      ret += node.textContent
    } else if (node.nodeType === 3) {
      ret += node.textContent
    }
  }
  return ret.trim()
}

export function resolveHeaders(
  headers: MenuItem[],
  range?: DefaultTheme.Config['outline']
): MenuItem[] {
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

  headers = headers.filter((h) => h.level >= high && h.level <= low)

  const ret: MenuItem[] = []
  outer: for (let i = 0; i < headers.length; i++) {
    const cur = headers[i]
    if (i === 0) {
      ret.push(cur)
    } else {
      for (let j = i - 1; j >= 0; j--) {
        const prev = headers[j]
        if (prev.level < cur.level) {
          ;(prev.children || (prev.children = [])).push(cur)
          continue outer
        }
      }
      ret.push(cur)
    }
  }

  return ret
}

export function useActiveAnchor(
  container: Ref<HTMLElement>,
  marker: Ref<HTMLElement>
) {
  const { isAsideEnabled } = useAside()

  const onScroll = throttleAndDebounce(setActiveLink, 100)

  const anchors: HTMLAnchorElement[] = []

  let prevActiveLink: HTMLAnchorElement | null = null

  watch(isAsideEnabled, (value) => (value ? reset : disable)())

  onContentUpdated(() => isAsideEnabled.value && reset())

  onUnmounted(disable)

  function reset() {
    disable()
    anchors.length = 0

    requestAnimationFrame(() => {
      const links = Array.from(
        container.value.querySelectorAll('.outline-link')
      ) as HTMLAnchorElement[]

      const anchorsAll = Array.from(
        document.querySelectorAll('.content .header-anchor')
      ) as HTMLAnchorElement[]

      anchors.push(
        ...anchorsAll.filter(
          (anchor) =>
            anchor.offsetParent !== null &&
            links.some((link) => link.hash === anchor.hash)
        )
      )

      if (anchors.length === 0) {
        prevActiveLink = null
        return
      }

      window.addEventListener('scroll', onScroll)
      setActiveLink()
    })
  }

  function disable() {
    window.removeEventListener('scroll', onScroll)
  }

  function setActiveLink() {
    const hash = getActiveAnchor(anchors)?.hash || ''
    const prev = prevActiveLink?.hash || ''

    if (hash === prev) {
      return
    }

    prevActiveLink?.classList.remove('active')

    const activeLink = hash
      ? (container.value.querySelector(
          `a[href="${decodeURIComponent(hash)}"]`
        ) as HTMLAnchorElement)
      : null

    if (activeLink) {
      activeLink.classList.add('active')
      marker.value.style.top = activeLink.offsetTop + 33 + 'px'
      marker.value.style.opacity = '1'
    } else {
      marker.value.style.top = '33px'
      marker.value.style.opacity = '0'
    }

    prevActiveLink = activeLink
  }
}

function getAnchorTop(anchor: HTMLAnchorElement) {
  return anchor.parentElement!.offsetTop - PAGE_OFFSET
}

function getActiveAnchor(anchors: HTMLAnchorElement[]) {
  const scrollTop = window.scrollY

  if (scrollTop < getAnchorTop(anchors[0])) {
    return null
  }

  for (let i = 0; i < anchors.length; i++) {
    const anchor = anchors[i]
    const nextAnchor = anchors[i + 1]

    if (!nextAnchor || scrollTop < getAnchorTop(nextAnchor)) {
      const innerHeight = window.innerHeight
      const offsetHeight = document.body.offsetHeight
      const isBottom = Math.abs(scrollTop + innerHeight - offsetHeight) < 1

      return isBottom ? anchors[anchors.length - 1] : anchor
    }
  }

  return null
}
