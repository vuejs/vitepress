import { inBrowser } from 'vitepress'

export function useCodeGroups() {
  if (inBrowser) {
    window.addEventListener('click', (e) => {
      const el = e.target as HTMLInputElement

      if (el.matches('.vp-code-group input')) {
        // input <- .tabs <- .vp-code-group
        const group = el.parentElement?.parentElement
        const i = Array.from(group?.querySelectorAll('input') || []).indexOf(el)

        // This filters out shiki twoslash divs with the `language-id` className.
        const filtered = Array.from(
          group?.querySelectorAll('div[class*="language-"]') || []
        ).filter((val) => !val.className.match('language-id'))

        const current = group?.querySelector('div[class*="language-"].active')
        const next = filtered?.[i]

        if (current && next && current !== next) {
          current.classList.remove('active')
          next.classList.add('active')
        }
      }
    })
  }
}
