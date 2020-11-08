import { onMounted, onUnmounted, onUpdated } from 'vue'

export function useActiveSidebarLinks() {
  let rootActiveLink: HTMLAnchorElement | null = null
  let activeLink: HTMLAnchorElement | null = null
  const decode = decodeURIComponent

  const deactiveLink = (link: HTMLAnchorElement | null) =>
    link && link.classList.remove('active')

  const activateLink = (hash: string) => {
    deactiveLink(activeLink)
    deactiveLink(rootActiveLink)
    activeLink = document.querySelector(`.sidebar a[href="${hash}"]`)
    if (activeLink) {
      activeLink.classList.add('active')
      // also add active class to parent h2 anchors
      const rootLi = activeLink.closest('.sidebar > ul > li')
      if (rootLi && rootLi !== activeLink.parentElement) {
        rootActiveLink = rootLi.querySelector('a')
        rootActiveLink && rootActiveLink.classList.add('active')
      } else {
        rootActiveLink = null
      }
    }
  }

  const setActiveLink = () => {
    const sidebarLinks = [].slice.call(
      document.querySelectorAll('.sidebar a')
    ) as HTMLAnchorElement[]

    const anchors = [].slice
      .call(document.querySelectorAll('.header-anchor'))
      .filter((anchor: HTMLAnchorElement) =>
        sidebarLinks.some((sidebarLink) => sidebarLink.hash === anchor.hash)
      ) as HTMLAnchorElement[]

    const pageOffset = (document.querySelector('.navbar') as HTMLElement)
      .offsetHeight
    const scrollTop = window.scrollY

    const getAnchorTop = (anchor: HTMLAnchorElement): number =>
      anchor.parentElement!.offsetTop - pageOffset - 15

    for (let i = 0; i < anchors.length; i++) {
      const anchor = anchors[i]
      const nextAnchor = anchors[i + 1]
      const isActive =
        (i === 0 && scrollTop === 0) ||
        (scrollTop >= getAnchorTop(anchor) &&
          (!nextAnchor || scrollTop < getAnchorTop(nextAnchor)))

      // TODO: fix case when at page bottom

      if (isActive) {
        const targetHash = decode(anchor.hash)
        history.replaceState(null, document.title, targetHash)
        activateLink(targetHash)
        return
      }
    }
  }

  const onScroll = throttleAndDebounce(setActiveLink, 300)
  onMounted(() => {
    setActiveLink()
    window.addEventListener('scroll', onScroll)
  })

  onUpdated(() => {
    // sidebar update means a route change
    activateLink(decode(location.hash))
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', onScroll)
  })
}

function throttleAndDebounce(fn: () => void, delay: number): () => void {
  let timeout: NodeJS.Timeout
  let called = false
  return () => {
    if (timeout) clearTimeout(timeout)
    if (!called) {
      fn()
      called = true
      setTimeout(() => {
        called = false
      }, delay)
    } else {
      timeout = setTimeout(fn, delay)
    }
  }
}
