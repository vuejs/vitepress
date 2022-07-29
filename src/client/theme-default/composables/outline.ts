import { Ref, computed, onMounted, onUpdated, onUnmounted } from 'vue'
import { Header, useData } from 'vitepress'
import { useAside } from '../composables/aside'
import { throttleAndDebounce } from '../support/utils'
import { PageData } from '../../../../types/shared'

interface HeaderWithChildren extends Header {
  children?: Header[]
  hidden?: boolean
}

export interface MenuItemWithLinkAndChildren {
  text: string
  link: string
  children?: MenuItemWithLinkAndChildren[]
  hidden?: boolean
}

// magic number to avoid repeated retrieval
const PAGE_OFFSET = 56

export function useOutline() {
  const { page } = useData()

  const hasOutline = computed(() => {
    return page.value.headers.length > 0
  })

  return {
    hasOutline
  }
}

export function resolveHeaders(
  headers: Header[],
  levelsRange: PageData['frontmatter']['outline'] = 2
) {
  const levels: [number, number] =
    typeof levelsRange === 'number'
      ? [levelsRange, levelsRange]
      : levelsRange === 'deep'
      ? [2, 6]
      : levelsRange

  return mapHeaders(groupMarkdownHeadersByChildren(headers, levels))
}

function addToParent(
  currIndex: number,
  headers: HeaderWithChildren[],
  levelsRange: [number, number]
): boolean {
  if (currIndex === 0) {
    return true
  }

  const currentHeader = headers[currIndex]
  for (let index = currIndex - 1; index >= 0; index--) {
    const header = headers[index]

    if (
      header.level < currentHeader.level &&
      header.level >= levelsRange[0] &&
      header.level <= levelsRange[1]
    ) {
      if (!header.children) {
        header.children = []
      }
      header.children.push(currentHeader)
      return false
    }
  }

  return true
}

function groupMarkdownHeadersByChildren(
  headers: Header[],
  levelsRange: [number, number]
): HeaderWithChildren[] {
  headers = headers.map((h) => Object.assign({}, h))

  const result: HeaderWithChildren[] = []

  headers.forEach((h, index) => {
    if (h.level >= levelsRange[0] && h.level <= levelsRange[1]) {
      const shouldAddToRoot = addToParent(index, headers, levelsRange)
      if (shouldAddToRoot) {
        result.push(h)
      }
    }
  })

  return result
}

function mapHeaders(
  headers: HeaderWithChildren[]
): MenuItemWithLinkAndChildren[] {
  return headers.map((header) => ({
    text: header.title,
    link: `#${header.slug}`,
    children: header.children ? mapHeaders(header.children) : undefined,
    hidden: header.hidden
  }))
}

export function useActiveAnchor(
  container: Ref<HTMLElement>,
  marker: Ref<HTMLElement>
) {
  const { isAsideEnabled } = useAside()

  const onScroll = throttleAndDebounce(setActiveLink, 100)

  let prevActiveLink: HTMLAnchorElement | null = null

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

  function setActiveLink() {
    if (!isAsideEnabled.value) {
      return
    }

    const links = [].slice.call(
      container.value.querySelectorAll('.outline-link')
    ) as HTMLAnchorElement[]

    const anchors = [].slice
      .call(document.querySelectorAll('.content .header-anchor'))
      .filter((anchor: HTMLAnchorElement) => {
        return links.some((link) => {
          return link.hash === anchor.hash && anchor.offsetParent !== null
        })
      }) as HTMLAnchorElement[]

    const scrollY = window.scrollY
    const innerHeight = window.innerHeight
    const offsetHeight = document.body.offsetHeight
    const isBottom = Math.abs(scrollY + innerHeight - offsetHeight) < 1

    // page bottom - highlight last one
    if (anchors.length && isBottom) {
      activateLink(anchors[anchors.length - 1].hash)
      return
    }

    for (let i = 0; i < anchors.length; i++) {
      const anchor = anchors[i]
      const nextAnchor = anchors[i + 1]

      const [isActive, hash] = isAnchorActive(i, anchor, nextAnchor)

      if (isActive) {
        activateLink(hash)
        return
      }
    }
  }

  function activateLink(hash: string | null) {
    if (prevActiveLink) {
      prevActiveLink.classList.remove('active')
    }

    if (hash !== null) {
      prevActiveLink = container.value.querySelector(
        `a[href="${decodeURIComponent(hash)}"]`
      ) as HTMLAnchorElement
    }

    const activeLink = prevActiveLink

    if (activeLink) {
      activeLink.classList.add('active')
      marker.value.style.top = activeLink.offsetTop + 33 + 'px'
      marker.value.style.opacity = '1'
    } else {
      marker.value.style.top = '33px'
      marker.value.style.opacity = '0'
    }
  }
}

function getAnchorTop(anchor: HTMLAnchorElement): number {
  return anchor.parentElement!.offsetTop - PAGE_OFFSET - 15
}

function isAnchorActive(
  index: number,
  anchor: HTMLAnchorElement,
  nextAnchor: HTMLAnchorElement | undefined
): [boolean, string | null] {
  const scrollTop = window.scrollY

  if (index === 0 && scrollTop === 0) {
    return [true, null]
  }

  if (scrollTop < getAnchorTop(anchor)) {
    return [false, null]
  }

  if (!nextAnchor || scrollTop < getAnchorTop(nextAnchor)) {
    return [true, anchor.hash]
  }

  return [false, null]
}
