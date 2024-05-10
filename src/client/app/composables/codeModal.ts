import { inBrowser } from 'vitepress'

export function useCodeModal() {
  if (inBrowser) {
    window.addEventListener('click', (e) => {
      const el = e.target as HTMLElement

      if (el.matches('div[class*="language-"] > button.modal')) {
        const parent = el.parentElement
        const sibling = el.nextElementSibling
        if (!parent || !sibling) {
          return
        }

        sibling.classList.add('open')
      }

      if (el.matches('div[class*="language-"] > div.modal-container')) {
        el.classList.remove('open')
      }
    })

    window.addEventListener('keydown', (ev) => {
      if (ev.key == 'Escape') {
        let modal = window.document.querySelector(
          'div[class*="language-"] > div.modal-container.open'
        )

        if (!modal) {
          return
        }

        modal.classList.remove('open')
      }
    })
  }
}
