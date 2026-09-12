import { computed } from 'vue'

import { isActive, normalize } from '../../shared'
import { getFlatSideBarLinks, getSidebar } from '../support/sidebar'
import { uniqBy } from '../support/utils'
import { useData } from './data'

export function usePrevNext() {
  const { theme, page, frontmatter } = useData()

  return computed<{
    prev?: { text?: string; link?: string; target?: string; rel?: string }
    next?: { text?: string; link?: string; target?: string; rel?: string }
  }>(() => {
    const sidebar = getSidebar(theme.value.sidebar, page.value.relativePath)
    const links = getFlatSideBarLinks(sidebar)

    // ignore inner-page links with hashes
    const candidates = uniqBy(links, (link) => normalize(link.link))

    const index = candidates.findIndex((link) => {
      return isActive(page.value.relativePath, '', link.link, false, true)
    })

    // a page outside the sidebar (the not-found page, for one) has no
    // neighbours; `candidates[-1 + 1]` would otherwise elect the first entry
    const prevCandidate = index === -1 ? undefined : candidates[index - 1]
    const nextCandidate = index === -1 ? undefined : candidates[index + 1]

    const hidePrev =
      (theme.value.docFooter?.prev === false && !frontmatter.value.prev) ||
      frontmatter.value.prev === false

    const hideNext =
      (theme.value.docFooter?.next === false && !frontmatter.value.next) ||
      frontmatter.value.next === false

    return {
      prev: hidePrev
        ? undefined
        : {
            text:
              (typeof frontmatter.value.prev === 'string'
                ? frontmatter.value.prev
                : typeof frontmatter.value.prev === 'object'
                  ? frontmatter.value.prev.text
                  : undefined) ??
              prevCandidate?.docFooterText ??
              prevCandidate?.text,
            link:
              (typeof frontmatter.value.prev === 'object'
                ? frontmatter.value.prev.link
                : undefined) ?? prevCandidate?.link,
            target:
              (typeof frontmatter.value.prev === 'object'
                ? frontmatter.value.prev.target
                : undefined) ?? prevCandidate?.target,
            rel:
              (typeof frontmatter.value.prev === 'object'
                ? frontmatter.value.prev.rel
                : undefined) ?? prevCandidate?.rel
          },
      next: hideNext
        ? undefined
        : {
            text:
              (typeof frontmatter.value.next === 'string'
                ? frontmatter.value.next
                : typeof frontmatter.value.next === 'object'
                  ? frontmatter.value.next.text
                  : undefined) ??
              nextCandidate?.docFooterText ??
              nextCandidate?.text,
            link:
              (typeof frontmatter.value.next === 'object'
                ? frontmatter.value.next.link
                : undefined) ?? nextCandidate?.link,
            target:
              (typeof frontmatter.value.next === 'object'
                ? frontmatter.value.next.target
                : undefined) ?? nextCandidate?.target,
            rel:
              (typeof frontmatter.value.next === 'object'
                ? frontmatter.value.next.rel
                : undefined) ?? nextCandidate?.rel
          }
    }
  })
}
