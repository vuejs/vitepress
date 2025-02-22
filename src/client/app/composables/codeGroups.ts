import { inBrowser, onContentUpdated } from 'vitepress'

export function useCodeGroups() {
  if (import.meta.env.DEV) {
    onContentUpdated(() => {
      document.querySelectorAll('.vp-code-group > .blocks').forEach((el) => {
        Array.from(el.children).forEach((child) => {
          child.classList.remove('active')
        })
        el.children[0].classList.add('active')
      })
    })
  }

  if (inBrowser) {
    function syncMultipleCodeGroups(group: HTMLElement) {
      const selector = group.className
        .split(' ')
        .filter(Boolean)
        .map((c) => `.${c}`)
        .join('')
      let checkTabText =
        group.querySelector('input:checked')?.nextElementSibling?.textContent ||
        ''
      document.querySelectorAll(selector).forEach((groupEl) => {
        if (group === groupEl) {
          return
        }
        const labels = groupEl.querySelectorAll('label')
        if (!labels.length) return
        const targetIndex = Array.from(labels).findIndex(
          (label) => label.textContent === checkTabText
        )
        if (targetIndex < 0) return
        const input = labels[targetIndex]
          .previousElementSibling as HTMLInputElement
        input.checked = true
        const blocks = groupEl.querySelector('.blocks')
        if (!blocks) return
        const current = blocks.children[targetIndex]
        if (!current) return
        Array.from(blocks.children).forEach((child) => {
          child.classList.remove('active')
        })
        blocks.children[targetIndex].classList.add('active')
      })
    }
    window.addEventListener('click', (e) => {
      const el = e.target as HTMLInputElement

      if (el.matches('.vp-code-group input')) {
        // input <- .tabs <- .vp-code-group
        const group = el.parentElement?.parentElement
        if (!group) return

        const i = Array.from(group.querySelectorAll('input')).indexOf(el)
        if (i < 0) return

        const blocks = group.querySelector('.blocks')
        if (!blocks) return

        const current = Array.from(blocks.children).find((child) =>
          child.classList.contains('active')
        )
        if (!current) return

        const next = blocks.children[i]
        if (!next || current === next) return

        current.classList.remove('active')
        next.classList.add('active')

        syncMultipleCodeGroups(group)

        const label = group?.querySelector(`label[for="${el.id}"]`)
        label?.scrollIntoView({ block: 'nearest' })
      }
    })
  }
}
